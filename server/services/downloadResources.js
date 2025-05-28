import fs from 'fs';
import path from 'path';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { MarkdownRenderer } from 'pdfkit-markdown';
import MarkdownIt from 'markdown-it';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    ImageRun,
    AlignmentType,
    PageBreak,
    ExternalHyperlink
} from 'docx';
import puppeteer from 'puppeteer';
import ApiError from '../utils/ApiError.js';
import Node from '../models/Node.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Utility: Download an image URL to a temporary file
// async function downloadImageToTemp(url) {
//     const response = await axios.get(url, { responseType: 'arraybuffer' });
//     const tempFilename = path.join(__dirname, `tmp_${Date.now()}_${path.basename(url)}`);
//     fs.writeFileSync(tempFilename, response.data);
//     return tempFilename;
// }

async function generateMarkmapSvgScreenshot(markdown) {
    let browser;
    // 1) Build HTML with no leading indentation inside the <script> block
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    /* Ensure the Markmap SVG fills its container */
    svg.markmap {
      width: 100vw;
      height: 100vh;
      font-family: Arial, sans-serif;
      font-size: 20px;
      background-color: #000000; /* Light gray background */
      color: #ffffff; /* Dark text color */
    }
   
  </style>
  <script src="https://cdn.jsdelivr.net/npm/markmap-autoloader@0.18"></script>
</head>
<body>
  <div class="markmap">
    <script type="text/template">
---
markmap:
  minWidth: 300
  colorFreezeLevel: 3
---
${markdown}
    </script>
  </div>
</body>
</html>
  `;

    // 2) Write temporary HTML file
    const tempHtmlPath = path.join(__dirname, `markmap_${Date.now()}.html`);
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

    // 3) Launch Puppeteer
    try {
        browser = await puppeteer.launch({
            headless: true,
            // If you're on a Linux container, you may need:
            // args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        // 4) Navigate to the local file:// path
        //    (On Windows this might look like file:///C:/…/markmap_12345.html)
        await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });

        // 5) Wait for the rendered <svg> inside .markmap
        //    We give it up to 5 seconds in case complex diagrams take a moment.
        await page.waitForSelector('.markmap', { timeout: 4000 });

        // 6) Grab the element handle for that SVG
        const svgHandle = await page.$('.markmap');
        if (!svgHandle) {
            throw new Error('Could not find .markmap svg node');
        }

        // 7) Take a screenshot of *only that SVG node*
        //    We’ll save it as a temporary PNG in __dirname
        const tempPngPath = path.join(__dirname, `markmap_${Date.now()}.png`);
        await svgHandle.screenshot({
            path: tempPngPath,
            omitBackground: true, // PNG will have transparent background if the SVG background is transparent
        });
        return tempPngPath;
    } catch (err) {
        console.error('[generateMarkmapSvgScreenshot ERROR]', err);
        throw err;
    } finally {
        // 8) Cleanup—close Puppeteer and remove the HTML file
        if (browser) {
            await browser.close();
        }
        if (fs.existsSync(tempHtmlPath)) {
            fs.unlinkSync(tempHtmlPath);
        }
    }
}

const downloadResources = asyncHandler(async (req, res) => {
    const { nodeId } = req.params;
    let { format } = req.body;
    const { user } = req;

    // Validate input
    if (!nodeId) {
        throw new ApiError(400, 'Node ID is required');
    }
    if (!format) {
        format = 'pdf';
    }
    if (!['pdf', 'doc'].includes(format)) {
        throw new ApiError(400, 'Invalid format. Use "pdf" or "doc"');
    }

    // Fetch & authorize
    const node = await Node.findById(nodeId).populate('mindmapId');
    if (!node) throw new ApiError(404, 'Node not found');
    const mindmap = node.mindmapId;

    // Extract data
    const nodeData = {
        label: node.data.label,
        shortDesc: node.data.shortDesc || 'No description provided',
        status: node.status,
        priority: node.data.priority || 0,
        resources: node.resources || {},
    };
    const mindmapData = {
        title: mindmap.title,
        owner: user.name,
        createdAt: mindmap.createdAt.toLocaleDateString('en-GB'),
        visibility: mindmap.visibility,
        tags: mindmap.tags.join(', ') || 'None',
    };

    const fileBase = `${nodeData.label}`;
    const pdfFileName = `${fileBase}.pdf`;

    if (format === 'pdf') {
        // ─────────────── PDF Branch ───────────────
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${pdfFileName}"`,
        });

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        // Header
        doc
            .font('Helvetica-Bold')
            .fontSize(20)
            .text(`Mindmap: ${mindmapData.title}`, { align: 'center' });
        doc.moveDown(1);

        // Metadata
        doc
            .font('Helvetica')
            .fontSize(12)
            .text(`Owner: ${mindmapData.owner}`, { align: 'left' })
            .text(`Created: ${mindmapData.createdAt}`, { align: 'left' })
            .text(`Visibility: ${mindmapData.visibility}`, { align: 'left' })
            .text(`Tags: ${mindmapData.tags}`, { align: 'left' });
        doc.moveDown(1);

        // Node Info
        doc
            .font('Helvetica-Bold')
            .fontSize(16)
            .text(`Node: ${nodeData.label}`, { align: 'left' });
        doc
            .font('Helvetica')
            .fontSize(12)
            .text(`Description: ${nodeData.shortDesc}`, { align: 'left' })
            .text(`Status: ${nodeData.status}`, { align: 'left' });
        doc.moveDown(1);

        // Resources Header
        doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .text('Resources', { align: 'left' });
        doc.moveDown(0.5);

        // Links
        if (nodeData.resources.links?.length > 0) {
            doc
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Links:', { align: 'left' });
            doc.moveDown(0.5);

            nodeData.resources.links.forEach((link) => {
                doc
                    .font('Helvetica')
                    .fontSize(10)
                    .fillColor('blue')
                    .text(`${link.title || link.url}`, {
                        link: link.url,
                        continued: true,
                        underline: true,
                    })
                    .fillColor('black')
                    .text(`  (${link.url})`, { align: 'left' });
                if (link.description) {
                    doc
                        .font('Helvetica')
                        .fontSize(10)
                        .text(`    Description: ${link.description}`, { align: 'left' });
                }
                doc.moveDown(0.5);
            });

            doc.moveDown(0.5);
        }

        // Images
        // if (nodeData.resources.images?.length > 0) {
        //     doc
        //         .font('Helvetica-Bold')
        //         .fontSize(12)
        //         .text('Images:', { align: 'left' });
        //     doc.moveDown(0.5);

        //     for (const image of nodeData.resources.images) {
        //         try {
        //             const tempPath = await downloadImageToTemp(image.url);
        //             doc.image(tempPath, { fit: [400, 300], align: 'center' });
        //             if (image.caption) {
        //                 doc
        //                     .font('Helvetica-Oblique')
        //                     .fontSize(10)
        //                     .text(`Caption: ${image.caption}`, { align: 'center' });
        //             }
        //             fs.unlinkSync(tempPath);
        //         } catch (err) {
        //             doc
        //                 .font('Helvetica')
        //                 .fontSize(10)
        //                 .text(`- ${image.url} (Failed to load)`, { align: 'left' });
        //         }
        //         doc.moveDown(0.5);
        //     }

        //     doc.moveDown(0.5);
        // }

        // Markdown
        if (nodeData.resources.markdown?.length > 0) {
            doc
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Description:', { align: 'left' });
            doc.moveDown(0.5);

            nodeData.resources.markdown.forEach((md) => {
                const tree = unified().use(remarkParse).parse(md.content);
                new MarkdownRenderer(doc).render(tree);
                doc.moveDown(0.5);
            });

            doc.moveDown(0.5);
        }
        // codeSnippets
        if (nodeData.resources.codeSnippets?.length > 0) {
            // Section header for code snippets
            doc
                .font('Helvetica-Bold')
                .fontSize(14)
                .text('Code Snippets:', { align: 'left' });
            doc.moveDown(0.5);
            doc.moveDown(1);


            nodeData.resources.codeSnippets.forEach((snippet) => {
                // Render each code snippet in a monospaced font, with a light gray background
                const lines = snippet.content.split('\n');
                lines.forEach((line) => {
                    doc
                        .font('Courier')         // monospaced
                        .fontSize(10)
                        .fillColor('black')
                        .text(line, {
                            continued: false,
                            indent: 20,
                            // You can adjust the width or behavior as needed:
                            // width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 40
                        });
                });

                doc.moveDown(0.5);
                doc.moveDown(1);

            });

            doc.moveDown(0.5);
            doc.moveDown(1);

        }
        // ───────── Diagrams (Markmap as SVG) ─────────
        if (nodeData.resources.diagrams?.length > 0) {
            doc.addPage();
            doc
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Diagrams:', { align: 'left' });
            doc.moveDown(0.5);

            for (const diagram of nodeData.resources.diagrams) {
                try {
                    // 1) Generate png from Markdown
                    const screenshotPath = await generateMarkmapSvgScreenshot(diagram.content);
                    // add png image using path of image
                    doc.image(screenshotPath, { width: 550, height: 850, align: 'center', valign: 'center', fit: [550, 850] });

                    // 2) Remove the temporary screenshot file
                    fs.unlinkSync(screenshotPath);
                    doc
                        .font('Helvetica-Oblique')
                        .fontSize(10)
                        .text(`Diagram: ${diagram.format || 'Markmap'}`, {
                            align: 'center',
                        });
                } catch (err) {
                    console.error(err)
                    doc
                        .font('Helvetica')
                        .fontSize(10)
                        .text(`- ${diagram.format || 'Diagram'} (Failed to render)`, {
                            align: 'left',
                        });
                }
                doc.moveDown(0.5);
            }

            doc.moveDown(0.5);
        }

        if (nodeData.resources.notes?.length > 0) {
            doc.addPage();
            // 1) Print a section header
            doc
                .font('Helvetica-Bold')
                .fontSize(14)
                .text('Notes:', { align: 'left' });
            doc.moveDown(0.5);

            // 2) Iterate each note
            nodeData.resources.notes.forEach((note, idx) => {
                // a) Print the note's content in a readable font
                doc
                    .font('Helvetica')
                    .fontSize(12)
                    .fillColor('black')
                    .text(`• ${note.content}`, {
                        indent: 20,
                        align: 'left',
                    });
                doc.moveDown(0.25);

                // b) If there is metadata, print each key/value on its own line
                if (note.metadata && Object.keys(note.metadata).length > 0) {
                    Object.entries(note.metadata).forEach(([key, value]) => {
                        doc
                            .font('Helvetica-Oblique')
                            .fontSize(10)
                            .fillColor('gray')
                            .text(`   – ${key}: ${value}`, {
                                indent: 40,
                                align: 'left',
                            });
                        doc.moveDown(0.1);
                    });
                }

                // c) Add a bit of vertical space before the next note
                if (idx < nodeData.resources.notes.length - 1) {
                    doc.moveDown(0.5);
                }
            });

            // 3) Leave an extra margin after all notes
            doc.moveDown(1);
        }

        if (nodeData.resources.videos?.length > 0) {
            // Section header
            doc
                .font('Helvetica-Bold')
                .fontSize(14)
                .fillColor('black')
                .text('Videos:', { align: 'left' });
            doc.moveDown(0.5);

            nodeData.resources.videos.forEach((video) => {
                // 1) Title (if provided)
                if (video.title) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(12)
                        .fillColor('black')
                        .text(video.title, { indent: 20 });
                    doc.moveDown(0.25);
                }

                // 2) URL as a clickable link
                doc
                    .font('Helvetica')
                    .fontSize(10)
                    .fillColor('blue')
                    .text(video.url, {
                        link: video.url,
                        underline: true,
                        indent: 20,
                    });
                // Reset color back to black for subsequent text
                doc.fillColor('black');
                doc.moveDown(0.25);

                // 3) Description (if provided)
                if (video.description) {
                    doc
                        .font('Helvetica')
                        .fontSize(10)
                        .fillColor('black')
                        .text(video.description, {
                            indent: 20,
                        });
                    doc.moveDown(0.25);
                }

                // 4) Metadata (if provided)
                if (video.metadata && Object.keys(video.metadata).length > 0) {
                    Object.entries(video.metadata).forEach(([key, value]) => {
                        doc
                            .font('Helvetica-Oblique')
                            .fontSize(10)
                            .fillColor('gray')
                            .text(`– ${key}: ${value}`, {
                                indent: 40,
                            });
                        doc.moveDown(0.1);
                    });
                }

                // 5) Add vertical spacing before the next video
                doc.moveDown(0.5);
            });

            // 6) Leave extra space after all videos
            doc.moveDown(1);
        }

        // ─────────────── Footer ───────────────
        doc.text('This PDF is Generated by PathGenie', 20, doc.page.height - 50, {
            lineBreak: false,
            align: 'center',
        });

        doc.end();
        return;
    }

    // ─────────────── DOCX Branch ───────────────
    const mdParser = new MarkdownIt();
    const markdownChildren = [];

    if (nodeData.resources.markdown?.length > 0) {
        markdownChildren.push(
            new Paragraph({
                text: `Detailed Description for Mindmap: ${mindmapData.title} — Node: ${nodeData.label}`,
                style: 'MarkdownHeading1',
            })
        );

        for (const md of nodeData.resources.markdown) {
            const tokens = mdParser.parse(md.content, {});
            let i = 0;

            while (i < tokens.length) {
                const token = tokens[i];

                if (token.type === 'heading_open') {
                    const level = parseInt(token.tag.charAt(1), 10);
                    const inlineToken = tokens[i + 1];
                    const headingText = inlineToken.children
                        .map((child) => child.content || '')
                        .join('')
                        .trim();

                    let headingLevel = HeadingLevel.HEADING_1;
                    if (level === 2) headingLevel = HeadingLevel.HEADING_2;
                    else if (level === 3) headingLevel = HeadingLevel.HEADING_3;
                    else if (level === 4) headingLevel = HeadingLevel.HEADING_4;
                    else if (level === 5) headingLevel = HeadingLevel.HEADING_5;
                    else if (level === 6) headingLevel = HeadingLevel.HEADING_6;

                    markdownChildren.push(
                        new Paragraph({
                            text: headingText,
                            heading: headingLevel,
                        })
                    );
                    i += 3;
                    continue;
                }

                if (
                    token.type === 'bullet_list_open' ||
                    token.type === 'ordered_list_open'
                ) {
                    const isOrdered = token.type === 'ordered_list_open';
                    let listIndex = 1;
                    i += 1;

                    while (i < tokens.length && tokens[i].type !== 'list_close') {
                        if (tokens[i].type === 'list_item_open') {
                            i += 2;
                            const inline = tokens[i];
                            const itemText = inline.children
                                .map((child) => {
                                    if (child.type === 'text') return child.content;
                                    if (child.type === 'strong_open') return '';
                                    if (child.type === 'strong_close') return '';
                                    if (child.type === 'em_open') return '';
                                    if (child.type === 'em_close') return '';
                                    if (child.type === 'code_inline') return child.content;
                                    return child.content || '';
                                })
                                .join('')
                                .trim();

                            const runs = [];
                            inline.children.forEach((child) => {
                                if (child.type === 'text') {
                                    runs.push(new TextRun({ text: child.content }));
                                } else if (child.type === 'strong_open') {
                                    runs.push(new TextRun({ text: '', bold: true }));
                                } else if (child.type === 'strong_close') {
                                    runs.push(new TextRun({ text: '', bold: false }));
                                } else if (child.type === 'em_open') {
                                    runs.push(new TextRun({ text: '', italics: true }));
                                } else if (child.type === 'em_close') {
                                    runs.push(new TextRun({ text: '', italics: false }));
                                } else if (child.type === 'code_inline') {
                                    runs.push(
                                        new TextRun({
                                            text: child.content,
                                            font: 'Courier New',
                                            size: 20,
                                            shading: { type: 'CLEAR', fill: 'DDDDDD' },
                                        })
                                    );
                                }
                            });

                            if (isOrdered) {
                                runs.unshift(new TextRun({ text: `${listIndex}. `, bold: true }));
                                listIndex++;
                            } else {
                                runs.unshift(new TextRun({ text: '• ', bold: true }));
                            }

                            markdownChildren.push(
                                new Paragraph({
                                    children: runs,
                                    style: 'ListItem',
                                })
                            );

                            i += 3;
                            continue;
                        }
                        i += 1;
                    }

                    i += 1;
                    continue;
                }

                if (token.type === 'paragraph_open') {
                    const inlineToken = tokens[i + 1];
                    const runs = [];

                    inlineToken.children.forEach((child) => {
                        if (child.type === 'text') {
                            runs.push(new TextRun({ text: child.content }));
                        } else if (child.type === 'strong_open') {
                            runs.push(new TextRun({ text: '', bold: true }));
                        } else if (child.type === 'strong_close') {
                            runs.push(new TextRun({ text: '', bold: false }));
                        } else if (child.type === 'em_open') {
                            runs.push(new TextRun({ text: '', italics: true }));
                        } else if (child.type === 'em_close') {
                            runs.push(new TextRun({ text: '', italics: false }));
                        } else if (child.type === 'code_inline') {
                            runs.push(
                                new TextRun({
                                    text: child.content,
                                    font: 'Courier New',
                                    size: 20,
                                    shading: { type: 'CLEAR', fill: 'DDDDDD' },
                                })
                            );
                        }
                    });

                    markdownChildren.push(
                        new Paragraph({
                            children: runs,
                            style: 'MarkdownParagraph',
                        })
                    );

                    i += 3;
                    continue;
                }

                if (token.type === 'fence') {
                    markdownChildren.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: token.content.trimEnd(),
                                    font: 'Courier New',
                                    size: 20,
                                }),
                            ],
                            style: 'CodeBlock',
                        })
                    );
                    i += 1;
                    continue;
                }

                i += 1;
            }

            markdownChildren.push(new Paragraph({ text: '' }));
        }
    }

    if (markdownChildren.length === 0) {
        markdownChildren.push(
            new Paragraph({
                text: 'No markdown resources were found.',
                style: 'MarkdownParagraph',
            })
        );
    }

    const resourceChildren = [];

    resourceChildren.push(
        new Paragraph({
            text: `Mindmap: ${mindmapData.title}`,
            style: 'Heading1Custom',
        })
    );
    resourceChildren.push(
        new Paragraph({
            text: `Node: ${nodeData.label}`,
            style: 'Heading2Custom',
        })
    );
    resourceChildren.push(
        new Paragraph({
            text: `Owner: ${mindmapData.owner}  |  Created: ${mindmapData.createdAt}  |  Visibility: ${mindmapData.visibility}  |  Tags: ${mindmapData.tags}`,
            style: 'ResourceText',
        })
    );
    resourceChildren.push(new Paragraph({ text: '' }));

    if (nodeData.resources.links?.length > 0) {
        resourceChildren.push(
            new Paragraph({ text: 'Links:', style: 'Heading2Custom' })
        );

        nodeData.resources.links.forEach((link) => {
            const linkParagraph = new Paragraph({
                children: [
                    new ExternalHyperlink({
                        children: [
                            new TextRun({
                                text: link.title,
                                style: "Hyperlink",
                            }),
                        ],
                        link: link.url,
                    }),
                    new TextRun({
                        text: ` - ${link.description}`,
                        style: 'ResourceText',
                    }),
                ],
            });
            resourceChildren.push(linkParagraph);

            if (link.description) {
                resourceChildren.push(
                    new Paragraph({
                        text: `    Description: ${link.description}`,
                        style: 'ResourceText',
                    })
                );
            }
        });

        resourceChildren.push(new Paragraph({ text: '' }));
    }

    // if (nodeData.resources.images?.length > 0) {
    //     resourceChildren.push(
    //         new Paragraph({ text: 'Images:', style: 'Heading2Custom' })
    //     );
    //     for (const image of nodeData.resources.images) {
    //         try {
    //             const tempPath = await downloadImageToTemp(image.url);
    //             const dataBuffer = fs.readFileSync(tempPath);

    //             resourceChildren.push(
    //                 new Paragraph({
    //                     children: [
    //                         new ImageRun({
    //                             data: dataBuffer,
    //                             transformation: { width: 400, height: 300 },
    //                         }),
    //                     ],
    //                     alignment: AlignmentType.CENTER,
    //                 })
    //             );
    //             if (image.caption) {
    //                 resourceChildren.push(
    //                     new Paragraph({
    //                         text: `Caption: ${image.caption}`,
    //                         style: 'ResourceText',
    //                         alignment: AlignmentType.CENTER,
    //                     })
    //                 );
    //             }
    //             fs.unlinkSync(tempPath);
    //         } catch (err) {
    //             resourceChildren.push(
    //                 new Paragraph({
    //                     text: `- ${image.url} (Failed to load)`,
    //                     style: 'ResourceText',
    //                 })
    //             );
    //         }
    //         resourceChildren.push(new Paragraph({ text: '' }));
    //     }
    // }
    // codeSnippets
    if (nodeData.resources.codeSnippets?.length > 0) {
        // Heading for code snippets
        resourceChildren.push(
            new Paragraph({
                text: 'Code Snippets:',
                style: 'Heading2Custom', // reuse your “Heading2Custom” style
            })
        );

        nodeData.resources.codeSnippets.forEach((snippet) => {
            // Split content into lines so that each appears as its own paragraph,
            // styled with your “CodeBlock” paragraph style or similar.
            const lines = snippet.content.split('\n');
            lines.forEach((line) => {
                resourceChildren.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                font: 'Courier New',    // monospaced
                                size: 20,               // matches your CodeBlock size in docx styles
                                shading: { type: 'CLEAR', fill: 'DDDDDD' }, // light gray background
                            }),
                        ],
                        style: 'CodeBlock',        // your existing CodeBlock style that indents and shades
                    })
                );
            });

            // Add an empty paragraph for spacing after each snippet
            resourceChildren.push(new Paragraph({ text: '' }));
            resourceChildren.push(new Paragraph({ text: '' })); // extra space
            resourceChildren.push(
                new Paragraph({
                    text: `Snippet Language: ${snippet.language || 'Unknown'}`,
                    style: 'ResourceText',
                })
            );
        });

    }

    // ───────── Diagrams (Markmap PNG for DOCX) ─────────
    if (nodeData.resources.diagrams?.length > 0) {
        resourceChildren.push(
            new Paragraph({ text: 'Diagrams:', style: 'Heading2Custom' })
        );
        for (const diagram of nodeData.resources.diagrams) {
            try {
                // DOCX does not natively accept SVG. We convert to PNG for now:
                const tempPngPath = await generateMarkmapSvgScreenshot(diagram.content);
                const dataBuffer = fs.readFileSync(tempPngPath);

                resourceChildren.push(
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: dataBuffer,
                                transformation: { width: 650, height: 700 },
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                    })
                );
                fs.unlinkSync(tempPngPath);
                resourceChildren.push(
                    new Paragraph({
                        text: `Diagram: ${diagram.format || 'Markmap (PNG fallback)'}`,
                        style: 'ResourceText',
                        alignment: AlignmentType.CENTER,
                    })
                );
            } catch (err) {
                resourceChildren.push(
                    new Paragraph({
                        text: `- ${diagram.format || 'Diagram'} (Failed to render)`,
                        style: 'ResourceText',
                    })
                );
            }
            resourceChildren.push(new Paragraph({ text: '' }));
        }
    }

    if (nodeData.resources.notes?.length > 0) {
        // 1) Section heading “Notes:”
        resourceChildren.push(
            new Paragraph({
                text: 'Notes:',
                style: 'Heading2Custom', // reuse your existing heading‐style
            })
        );

        // 2) Iterate each note
        nodeData.resources.notes.forEach((note, idx) => {
            // a) The note content itself, as a bulleted list item
            resourceChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `• ${note.content}`,
                            font: 'Calibri',
                            size: 24, // match your normal text size
                        }),
                    ],
                    style: 'Normal', // or a custom “NoteItem” style if you have one
                    indent: { left: 480 }, // indent bullet by half an inch
                })
            );

            // b) If metadata exists, show each key/value with a smaller, italic font
            if (note.metadata && Object.keys(note.metadata).length > 0) {
                Object.entries(note.metadata).forEach(([key, value]) => {
                    resourceChildren.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `   – ${key}: ${value}`,
                                    font: 'Calibri',
                                    size: 20,      // slightly smaller than normal
                                    italics: true, // show metadata in italic
                                    color: '666666',
                                }),
                            ],
                            style: 'MarkdownParagraph',
                            indent: { left: 720 }, // further indent the metadata under the bullet
                        })
                    );
                });
            }

            // c) Add a blank paragraph between notes (but not after the last one)
            if (idx < nodeData.resources.notes.length - 1) {
                resourceChildren.push(new Paragraph({ text: '' }));
            }
        });

        // 3) Add one extra blank line after the entire notes section
        resourceChildren.push(new Paragraph({ text: '' }));
    }

    if (nodeData.resources.videos?.length > 0) {
        // 1) Section heading “Videos:”
        resourceChildren.push(
            new Paragraph({
                text: 'Videos:',
                style: 'Heading2Custom', // reuse your Heading2 style
            })
        );

        nodeData.resources.videos.forEach((video) => {
            // 2) Video title (if provided) in bold
            if (video.title) {
                resourceChildren.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: video.title,
                                bold: true,
                                font: 'Calibri',
                                size: 28, // matches Heading3 or adjust as needed
                            }),
                        ],
                        style: 'Normal',
                        indent: { left: 480 }, // 0.5" indent under the “Videos:” heading
                    })
                );
            }

            // 3) URL (blue, underlined) as a “link‐style” text run
            resourceChildren.push(
                new Paragraph({
                    children: [
                        new ExternalHyperlink({
                            children: [
                                new TextRun({
                                    text: video.url,
                                    color: '0000FF',
                                    underline: true,
                                }),
                            ],
                            href: video.url,
                        })
                    ],
                    style: 'ResourceText',
                    indent: { left: 480 }, // same indent as title
                })
            );

            // 4) Description (if provided)
            if (video.description) {
                resourceChildren.push(
                    new Paragraph({
                        text: video.description,
                        style: 'ResourceText',
                        indent: { left: 480 },
                    })
                );
            }

            // 5) Metadata (if provided)
            if (video.metadata && Object.keys(video.metadata).length > 0) {
                Object.entries(video.metadata).forEach(([key, value]) => {
                    resourceChildren.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `– ${key}: ${value}`,
                                    font: 'Calibri',
                                    size: 20,       // slightly smaller
                                    italics: true,
                                    color: '666666',
                                }),
                            ],
                            style: 'MarkdownParagraph',
                            indent: { left: 720 }, // further indent under the URL/description
                        })
                    );
                });
            }

            // 6) Blank paragraph to separate videos
            resourceChildren.push(new Paragraph({ text: '' }));
        });
    }

    const allChildren = [
        ...resourceChildren,
        new Paragraph({ children: [new PageBreak()] }),
        ...markdownChildren,
    ];

    const docx = new Document({
        styles: {
            default: {
                document: {
                    run: { font: 'Calibri', size: 24 },
                },
            },
            paragraphStyles: [
                {
                    id: 'MarkdownResource',
                    name: 'Markdown Resource Text',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: false,
                    run: { font: 'Calibri', size: 24, color: '000000' },
                    paragraph: { spacing: { after: 120 }, align: AlignmentType.LEFT },
                },
                {
                    id: 'Heading1Custom',
                    name: 'Custom Heading 1',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { font: 'Calibri Light', size: 32, bold: true, color: '003366' },
                    paragraph: { spacing: { after: 240 }, align: AlignmentType.CENTER },
                },
                {
                    id: 'Heading2Custom',
                    name: 'Custom Heading 2',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { font: 'Calibri Light', size: 28, bold: true, color: '0055AA' },
                    paragraph: { spacing: { after: 160 }, align: AlignmentType.LEFT },
                },
                {
                    id: 'ResourceText',
                    name: 'Resource Text',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: false,
                    run: { font: 'Calibri', size: 24, color: '000000' },
                    paragraph: { spacing: { after: 120 }, align: AlignmentType.LEFT },
                },
                {
                    id: 'MarkdownHeading1',
                    name: 'Markdown Heading 1',
                    basedOn: 'Normal',
                    quickFormat: true,
                    run: { font: 'Calibri Light', size: 32, bold: true, color: '003366' },
                    paragraph: { spacing: { after: 240, before: 240 }, align: AlignmentType.CENTER },
                },
                {
                    id: 'MarkdownHeading2',
                    name: 'Markdown Heading 2',
                    basedOn: 'Normal',
                    quickFormat: true,
                    run: { font: 'Calibri Light', size: 28, bold: true, color: '0055AA' },
                    paragraph: { spacing: { after: 200, before: 200 }, align: AlignmentType.LEFT },
                },
                {
                    id: 'MarkdownParagraph',
                    name: 'Markdown Paragraph',
                    basedOn: 'Normal',
                    quickFormat: false,
                    run: { font: 'Calibri', size: 24, color: '000000' },
                    paragraph: { spacing: { after: 160, before: 160 }, align: AlignmentType.LEFT },
                },
                {
                    id: 'CodeBlock',
                    name: 'Code Block',
                    basedOn: 'Normal',
                    quickFormat: false,
                    run: { font: 'Courier New', size: 20, color: '000000' },
                    paragraph: {
                        spacing: { after: 160, before: 160 },
                        indent: { left: 720 },
                        shading: { fill: 'EEEEEE' },
                    },
                },
                {
                    id: 'ListItem',
                    name: 'List Item',
                    basedOn: 'Normal',
                    quickFormat: false,
                    run: { font: 'Calibri', size: 24, color: '000000' },
                    paragraph: {
                        spacing: { after: 120, before: 120 },
                        indent: { left: 480 },
                    },
                },
            ],
        },
        sections: [
            {
                children: allChildren,
            },
        ],
    });

    const buffer = await Packer.toBuffer(docx);
    const fileName = `${nodeData.label}.docx`;
    res.set({
        'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.send(buffer);
});

export default downloadResources;
