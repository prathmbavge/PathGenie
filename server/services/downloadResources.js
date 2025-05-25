// downloadResources.js
import fs from 'fs';
import path from 'path';
import axios from 'axios'; // for downloading images
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
} from 'docx';

import ApiError from '../utils/ApiError.js'; // your error‐class
import Node from '../models/Node.model.js'; // your Mongoose model
import asyncHandler from '../utils/asyncHandler.js'; // your wrapper

// In ESM, __dirname is not defined. We recreate it here:
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Utility: download an image URL to a temporary file, return local path
async function downloadImageToTemp(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const tempFilename = path.join(
        __dirname,
        `tmp_${Date.now()}_${path.basename(url)}`
    );
    fs.writeFileSync(tempFilename, response.data);
    return tempFilename;
}

const downloadResources = asyncHandler(async (req, res) => {
    const { nodeId } = req.params;
    let { format } = req.body; // 'pdf' or 'doc'
    const { user } = req;

    // ——— Validate input —————————————————————————
    if (!nodeId) {
        throw new ApiError(400, 'Node ID is required');
    }
    if (!format) {
        format = 'pdf';
    }
    if (!['pdf', 'doc'].includes(format)) {
        throw new ApiError(400, 'Invalid format. Use "pdf" or "doc"');
    }

    // ——— Fetch & authorize —————————————————————————
    const node = await Node.findById(nodeId).populate('mindmapId');
    if (!node) throw new ApiError(404, 'Node not found');
    const mindmap = node.mindmapId;
    if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
        throw new ApiError(403, 'You do not have permission to access this node');
    }

    // ——— Extract data —————————————————————————————
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
        createdAt: mindmap.createdAt.toLocaleDateString('en-GB'), // e.g. "25/05/2025"
        visibility: mindmap.visibility,
        tags: mindmap.tags.join(', ') || 'None',
    };

    const fileBase = `node_${node.data.label}`;
    const pdfFileName = `${fileBase}.pdf`;

    if (format === 'pdf') {
        // ————————————————— PDF BRANCH ——————————————————————————————————————————————
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${pdfFileName}"`,
        });

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        // — Header ——————————————————————————————
        doc
            .font('Helvetica-Bold')
            .fontSize(20)
            .text(`Mindmap: ${mindmapData.title}`, { align: 'center' });
        doc.moveDown(1);

        // — Metadata ————————————————————————————
        doc
            .font('Helvetica')
            .fontSize(12)
            .text(`Owner: ${mindmapData.owner}`, { align: 'left' })
            .text(`Created: ${mindmapData.createdAt}`, { align: 'left' })
            .text(`Visibility: ${mindmapData.visibility}`, { align: 'left' })
            .text(`Tags: ${mindmapData.tags}`, { align: 'left' });
        doc.moveDown(1);

        // — Node Info —————————————————————————————
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

        // — Resources Header ——————————————————————
        doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .text('Resources', { align: 'left' });
        doc.moveDown(0.5);

        // — Links ————————————————————————————————
        if (nodeData.resources.links?.length > 0) {
            doc
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Links:', { align: 'left' });
            doc.moveDown(0.5);

            nodeData.resources.links.forEach(link => {
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

        // — Images ————————————————————————————————
        if (nodeData.resources.images?.length > 0) {
            doc
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Images:', { align: 'left' });
            doc.moveDown(0.5);

            for (const image of nodeData.resources.images) {
                try {
                    const tempPath = await downloadImageToTemp(image.url);
                    doc.image(tempPath, { fit: [400, 300], align: 'center' });
                    if (image.caption) {
                        doc
                            .font('Helvetica-Oblique')
                            .fontSize(10)
                            .text(`Caption: ${image.caption}`, { align: 'center' });
                    }
                    fs.unlinkSync(tempPath);
                } catch (err) {
                    doc
                        .font('Helvetica')
                        .fontSize(10)
                        .text(`- ${image.url} (Failed to load)`, { align: 'left' });
                }
                doc.moveDown(0.5);
            }

            doc.moveDown(0.5);
        }

        // — Markdown (using pdfkit-markdown) —————————————————
        if (nodeData.resources.markdown?.length > 0) {
            doc
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Description:', { align: 'left' });
            doc.moveDown(0.5);

            nodeData.resources.markdown.forEach(md => {
                const tree = unified().use(remarkParse).parse(md.content);
                new MarkdownRenderer(doc).render(tree);
                doc.moveDown(0.5);
            });

            doc.moveDown(0.5);
        }

        // — Diagrams (placeholder) ————————————————————
        if (nodeData.resources.diagrams?.length > 0) {
            doc
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Diagrams:', { align: 'left' });
            doc.moveDown(0.5);

            nodeData.resources.diagrams.forEach(diagram => {
                doc
                    .font('Helvetica')
                    .fontSize(10)
                    .text(`- ${diagram.format}: ${diagram.content.substring(0, 50)}...`, {
                        align: 'left',
                    });
                doc.moveDown(0.5);
            });

            doc.moveDown(0.5);
        }

        doc.end();
        return;
    }

    // ——————————————————————————————— DOCX BRANCH (single .docx) ——————————————————————————————

    // 2) Build “Markdown only” paragraph array
    const mdParser = new MarkdownIt();
    // This array will collect Paragraphs for the entire Markdown section.
    const markdownChildren = [];

    if (nodeData.resources.markdown?.length > 0) {
        // 2a) Title for the entire Markdown section
        markdownChildren.push(
            new Paragraph({
                text: `Detailed Description for Mindmap: ${mindmapData.title} — Node: ${nodeData.label}`,
                style: 'MarkdownHeading1',
            })
        );

        for (const md of nodeData.resources.markdown) {
            

            // 2b) Tokenize the full Markdown block
            const tokens = mdParser.parse(md.content, {});
            let i = 0;

            while (i < tokens.length) {
                const token = tokens[i];

                // ─── HEADINGS ───────────────────────────────────────────────────────────────
                if (token.type === 'heading_open') {
                    const level = parseInt(token.tag.charAt(1), 10);
                    const inlineToken = tokens[i + 1];
                    const headingText = inlineToken.children
                        .map(child => child.content || '')
                        .join('').trim();

                    // Choose built‐in HeadingLevel
                    let headingLevel = HeadingLevel.HEADING_1;
                    if (level === 2) headingLevel = HeadingLevel.HEADING_2;
                    else if (level === 3) headingLevel = HeadingLevel.HEADING_3;
                    else if (level === 4) headingLevel = HeadingLevel.HEADING_4;
                    else if (level === 5) headingLevel = HeadingLevel.HEADING_5;
                    else if (level === 6) headingLevel = HeadingLevel.HEADING_6;
                    
                    // (You can extend for deeper headings if desired.)

                    markdownChildren.push(
                        new Paragraph({
                            text: headingText,
                            heading: headingLevel,
                        })
                    );
                    i += 3; // skip heading_open, inline, heading_close
                    continue;
                }

                // ─── BULLET / ORDERED LIST ───────────────────────────────────────────────────
                if (
                    token.type === 'bullet_list_open' ||
                    token.type === 'ordered_list_open'
                ) {
                    const isOrdered = token.type === 'ordered_list_open';
                    let listIndex = 1; // for manual numbering if desired
                    i += 1; // jump into list items

                    while (i < tokens.length && tokens[i].type !== 'list_close') {
                        if (tokens[i].type === 'list_item_open') {
                            // Skip list_item_open → paragraph_open
                            i += 2;
                            const inline = tokens[i]; // should be the inline token
                            const itemText = inline.children
                                .map(child => {
                                    if (child.type === 'text') return child.content;
                                    if (child.type === 'strong_open') return ''; // formatting markers
                                    if (child.type === 'strong_close') return '';
                                    if (child.type === 'em_open') return '';
                                    if (child.type === 'em_close') return '';
                                    if (child.type === 'code_inline') {
                                        // Inline code: highlight with background
                                        return child.content;
                                    }
                                    return child.content || '';
                                })
                                .join('').trim();

                            // Build the runs array, applying bold/italics/inline code as needed
                            const runs = [];
                            inline.children.forEach(child => {
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

                            // Add a bullet or number prefix
                            if (isOrdered) {
                                runs.unshift(
                                    new TextRun({ text: `${listIndex}. `, bold: true })
                                );
                                listIndex++;
                            } else {
                                runs.unshift(new TextRun({ text: '• ', bold: true }));
                            }

                            markdownChildren.push(
                                new Paragraph({
                                    children: runs,
                                    style: 'ListItem',
                                    numbering: undefined, // if you define a numbering configuration, you can specify it here
                                })
                            );

                            // Skip inline → paragraph_close → list_item_close
                            i += 3;
                            continue;
                        }
                        i += 1;
                    }

                    i += 1; // skip the list_close token
                    continue;
                }

                // ─── PARAGRAPHS w/ INLINE FORMATTING ────────────────────────────────────────
                if (token.type === 'paragraph_open') {
                    const inlineToken = tokens[i + 1];
                    const runs = [];

                    inlineToken.children.forEach(child => {
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

                    i += 3; // skip inline + paragraph_close
                    continue;
                }

                // ─── FENCED CODE BLOCKS ─────────────────────────────────────────────────────
                if (token.type === 'fence') {
                    // The entire content of the fence is a code block
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

                // ─── OTHERWISE SKIP ─────────────────────────────────────────────────────────
                i += 1;
            }

            // Blank line (spacer) after each Markdown block
            markdownChildren.push(new Paragraph({ text: '' }));
        }
    }

    // If there were no Markdown blocks at all, insert a friendly note:
    if (markdownChildren.length === 0) {
        markdownChildren.push(
            new Paragraph({
                text: 'No markdown resources were found.',
                style: 'MarkdownParagraph',
            })
        );
    }

    // 3) Build “Resources only” paragraph array
    const resourceChildren = [];

    // — Header for Resources doc —
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
    resourceChildren.push(new Paragraph({ text: '' })); // blank line

    // — Links —
    if (nodeData.resources.links?.length > 0) {
        resourceChildren.push(
            new Paragraph({ text: 'Links:', style: 'Heading2Custom' })
        );

        nodeData.resources.links.forEach(link => {
            const linkParagraph = new Paragraph({
                children: [
                    new TextRun({
                        text: `${link.title || link.url}`,
                        style: 'ResourceText',
                        color: '0000FF',
                        underline: {},
                    }),
                    new TextRun({
                        text: `  (${link.url})`,
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

    // — Images —
    if (nodeData.resources.images?.length > 0) {
        resourceChildren.push(
            new Paragraph({ text: 'Images:', style: 'Heading2Custom' })
        );
        for (const image of nodeData.resources.images) {
            try {
                const tempPath = await downloadImageToTemp(image.url);
                const dataBuffer = fs.readFileSync(tempPath);

                resourceChildren.push(
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: dataBuffer,
                                transformation: { width: 400, height: 300 },
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                    })
                );
                if (image.caption) {
                    resourceChildren.push(
                        new Paragraph({
                            text: `Caption: ${image.caption}`,
                            style: 'ResourceText',
                            alignment: AlignmentType.CENTER,
                        })
                    );
                }
                fs.unlinkSync(tempPath);
            } catch (err) {
                resourceChildren.push(
                    new Paragraph({
                        text: `- ${image.url} (Failed to load)`,
                        style: 'ResourceText',
                    })
                );
            }
            resourceChildren.push(new Paragraph({ text: '' }));
        }
    }

    // — Diagrams (placeholder) —
    if (nodeData.resources.diagrams?.length > 0) {
        resourceChildren.push(
            new Paragraph({ text: 'Diagrams:', style: 'Heading2Custom' })
        );
        nodeData.resources.diagrams.forEach(diagram => {
            resourceChildren.push(
                new Paragraph({
                    text: `- ${diagram.format}: ${diagram.content.substring(0, 50)}...`,
                    style: 'ResourceText',
                })
            );
        });
        resourceChildren.push(new Paragraph({ text: '' }));
    }

    // (You can add “Videos”, “Notes”, or “Code Snippets” similarly if you need.)

    // 4) Combine everything into one big array, inserting a page break between Markdown and Resources
    const allChildren = [
        ...resourceChildren,
        new Paragraph({ children: [new PageBreak()] }),
        ...markdownChildren,
    ];

    // 5) Create a single Document with our combined children
    const docx = new Document({
        styles: {
            default: {
                document: {
                    run: { font: 'Calibri', size: 24 }, // 12pt
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
                        indent: { left: 720 }, // half‐inch indent
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
                        indent: { left: 480 } // 1/3‐inch indent
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

    // 6) Send the final .docx buffer
    const buffer = await Packer.toBuffer(docx);
    const fileName = `node_${nodeData.label}.docx`;
    res.set({
        'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.send(buffer);
});

export default downloadResources;
