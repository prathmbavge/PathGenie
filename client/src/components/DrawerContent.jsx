import React, {
  useState,
  useCallback,
  memo,
  Suspense,
  useRef,
  useEffect,
} from "react";
import {
  FiDownload,
  FiX,
  FiLink,
  FiFileText,
  FiImage,
  FiFilm,
  FiCode,
} from "react-icons/fi";
import { FaExpand } from "react-icons/fa";
import { RxClipboardCopy } from "react-icons/rx";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useDownloadResources } from "../hooks/useRoadmap/useDownloadResources";
import AccordionSection from "./AccordionSection.jsx";
import ReactPlayer from "react-player/lazy";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { RiMindMap } from "react-icons/ri";
import { showSuccessToast } from "../../utils/toastUtils.js";

const MarkmapViewer = ({ markdown }) => {
  const svgRef = useRef(null);
  const markmapInstanceRef = useRef(null);

  useEffect(() => {
    const transformer = new Transformer();
    const { root } = transformer.transform(markdown);
    const svg = svgRef.current;

    if (markmapInstanceRef.current) {
      markmapInstanceRef.current.destroy();
    }

    markmapInstanceRef.current = Markmap.create(svg, null, root);

    return () => {
      if (markmapInstanceRef.current) {
        markmapInstanceRef.current.destroy();
      }
    };
  }, [markdown]);

  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", height: "100%", color: "#fff" }}
    />
  );
};

const DrawerContent = memo(({ content, onClose, setLoading, nodeId }) => {
  const downloadResources = useDownloadResources(setLoading);
  const [downloadFormat, setDownloadFormat] = useState("pdf");
  const [fullScreenContent, setFullScreenContent] = useState(null);

  const handleDownload = useCallback(() => {
    downloadResources(nodeId, downloadFormat);
  }, [downloadFormat, downloadResources, nodeId]);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    showSuccessToast("Code copied to clipboard!");
  };

  return (
    <>
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex h-full flex-col space-y-6 p-6 overflow-y-auto"
      >
        <div className="sticky top-4 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
              className="bg-black text-white px-3 py-2 border border-neon-blue/30"
            >
              <option value="pdf">PDF</option>
              <option value="doc">DOC</option>
            </select>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-2 text-neon-blue backdrop-blur-lg transition-all hover:border-neon-blue hover:bg-neon-blue/20 border-1"
            >
              <FiDownload className="h-5 w-5" />
              <span>Download Resources</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-1 py-2 text-neon-pink backdrop-blur-lg transition-all hover:border-neon-pink hover:bg-neon-pink/20 border-1"
          >
            <FiX className="h-5 w-5" />
            <span>Close</span>
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto">
          {content.links?.length > 0 && (
            <AccordionSection
              title="Links"
              icon={<FiLink className="h-5 w-5 text-neon-blue" />}
              glow="blue"
            >
              <ul className="space-y-3">
                {content.links.map((link, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-1 transition-colors hover:bg-white/5"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-neon-blue hover:text-neon-pink"
                    >
                      <FiLink className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{link.title || link.url}</span>
                    </a>
                    {link.description && (
                      <p className="mt-1 text-sm text-gray-300">
                        {link.description}
                      </p>
                    )}
                  </motion.li>
                ))}
              </ul>
            </AccordionSection>
          )}

          {content.markdown?.length > 0 && (
            <AccordionSection
              title="Markdown"
              icon={<FiFileText className="h-5 w-5 text-neon-blue" />}
              glow="pink"
            >
              <div className="relative">
                <div className="prose prose-invert max-h-[400px] overflow-y-auto">
                  {content.markdown.map((markdown, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-1 transition-colors hover:bg-white/5"
                    >
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            return !inline && match ? (
                              <>
                                <SyntaxHighlighter
                                  language={match[1]}
                                  PreTag="div"
                                  style={dark}
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                                {/* <RxClipboardCopy onClick={() => handleCopy(codeSnippet.content)}
                        size={50} color="white" className="absolute top-4 right-2 px-2 py-1 text-neon-blue hover:transform hover:scale-110  transition-all" /> */}
                              </>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {markdown.content}
                      </Markdown>
                      <button
                        onClick={() =>
                          setFullScreenContent({
                            type: "markmap",
                            markdown: markdown.content,
                          })
                        }
                        className="mt-2 px-3 py-1 text-neon-blue hover:text-neon-pink transition-all"
                      >
                        View as Mindmap
                      </button>
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => setFullScreenContent({ type: "markdown" })}
                  className="sticky bottom-0 mt-4 px-3 py-1 text-neon-blue hover:text-neon-pink transition-all bg-black border"
                >
                  Full Screen <FaExpand className="inline-block h-5 w-5" />
                </button>
              </div>
            </AccordionSection>
          )}

          {content.diagrams?.length > 0 && (
            <AccordionSection
              title="MarkMap"
              icon={<RiMindMap className="h-5 w-5 text-neon-blue" />}
              glow="pink"
            >
              <div className="relative">
                <div className="prose prose-invert overflow-y-auto max-h-[95vh] bg-gray-900">
                  {content.diagrams.map((markmap, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-1 transition-colors"
                    >
                      <MarkmapViewer markdown={markmap.content} />
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => setFullScreenContent({ type: "markmap" })}
                  className="sticky bottom-0 mt-4 px-3 py-1 text-neon-blue hover:text-neon-pink transition-all border bg-black"
                >
                  Full Screen <FaExpand className="inline-block h-5 w-5" />
                </button>
              </div>
            </AccordionSection>
          )}

          {content.codeSnippets?.length > 0 && (
            <AccordionSection
              title="Code Snippets"
              icon={<FiCode className="h-5 w-5 text-neon-blue" />}
              glow="pink"
            >
              <div className="relative">
                <div className="prose prose-invert max-h-[400px] overflow-y-auto">
                  {content.codeSnippets.map((codeSnippet, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-1 transition-colors hover:bg-white/5 relative"
                    >
                      <SyntaxHighlighter
                        language={codeSnippet.language || "javascript"}
                        style={dark}
                      >
                        {codeSnippet.content}
                      </SyntaxHighlighter>

                      <RxClipboardCopy
                        onClick={() => handleCopy(codeSnippet.content)}
                        size={40}
                        color="white"
                        className="absolute top-4 right-2 px-2 py-1 text-neon-blue hover:transform hover:scale-110  transition-all"
                      />
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => setFullScreenContent({ type: "code" })}
                  className="sticky bottom-0 mt-4 px-3 py-1 text-neon-blue hover:text-neon-pink transition-all bg-black border"
                >
                  Full Screen <FaExpand className="inline-block h-5 w-5" />
                </button>
              </div>
            </AccordionSection>
          )}

          {content.notes?.length > 0 && (
            <AccordionSection
              title="Notes"
              icon={<FiFileText className="h-5 w-5 text-neon-blue" />}
              glow="blue"
            >
              <div className="relative">
                <div className="prose prose-invert max-h-[400px] overflow-y-auto">
                  {content.notes.map((note, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-1 transition-colors hover:bg-white/5"
                    >
                      {note.content}
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => setFullScreenContent({ type: "notes" })}
                  className="sticky bottom-0 mt-4 px-3 py-1 text-neon-blue hover:text-neon-pink transition-all border"
                >
                  Full Screen <FaExpand className="inline-block h-5 w-5" />
                </button>
              </div>
            </AccordionSection>
          )}

          {content.images?.length > 0 && (
            <AccordionSection
              title="Images"
              icon={<FiImage className="h-5 w-5 text-neon-blue" />}
              glow="purple"
            >
              <div className="grid grid-cols-2 gap-4">
                {content.images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="relative overflow-hidden"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Image ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => setFullScreenContent({ type: "images" })}
                className="sticky bottom-0 mt-4 px-3 py-1 text-neon-blue hover:text-neon-pink transition-all border"
              >
                Full Screen <FaExpand className="inline-block h-5 w-5" />
              </button>
            </AccordionSection>
          )}

          {content.videos?.length > 0 && (
            <AccordionSection
              title="Videos"
              icon={<FiFilm className="w-5 text-neon-blue" />}
              glow="pink"
            >
              <div className="space-y-4">
                {content.videos.map((video, index) => (
                  <motion.div
                    key={index}
                    className="relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Suspense fallback={<div className="h-40 animate-pulse" />}>
                      <ReactPlayer
                        url={video.url}
                        width="100%"
                        height="100%"
                        light={<div className="h-40" />}
                        controls
                        className="shadow-lg"
                      />
                    </Suspense>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => setFullScreenContent({ type: "videos" })}
                className="sticky bottom-0 mt-4 px-3 py-1 text-neon-blue hover:text-neon-pink transition-all border"
              >
                Full Screen <FaExpand className="inline-block h-5 w-5" />
              </button>
            </AccordionSection>
          )}
        </div>
      </motion.aside>

      {fullScreenContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 backdrop-blur-lg z-50 flex items-center justify-center"
        >
          <div className="relative p-8 bg-black mx-5 w-full h-[95vh] overflow-auto">
            <button
              onClick={() => setFullScreenContent(null)}
              className="absolute top-4 right-4 px-2 py-1 text-neon-pink hover:text-neon-blue transition-all border w-24 flex items-center justify-center space-x-2 backdrop-blur-lg z-50"
            >
              Close <FiX className="h-5 w-5" />
            </button>
            {fullScreenContent.type === "markdown" && (
              <div className="prose prose-invert h-[80vh] w-full overflow-y-auto">
                {content.markdown.map((md, index) => (
                  <div key={index} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                      Markdown Section {index + 1}
                    </h2>
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              language={match[1]}
                              PreTag="div"
                              style={dark}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {md.content}
                    </Markdown>
                  </div>
                ))}
              </div>
            )}
            {fullScreenContent.type === "notes" && (
              <div className="prose prose-invert h-[80vh] w-full overflow-y-auto">
                {content.notes.map((note, index) => (
                  <div key={index} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                      Note {index + 1}
                    </h2>
                    <div>{note.content}</div>
                  </div>
                ))}
              </div>
            )}
            {fullScreenContent.type === "markmap" && (
              <div className="prose prose-invert">
                {content.diagrams.map((markmap, index) => (
                  <div key={index} className="mb-8 bg-gray-900">
                    <h2 className="text-2xl font-bold mb-4">
                      Markmap Diagram {index + 1}
                    </h2>
                    <div className="h-[80vh] w-full">
                      <MarkmapViewer markdown={markmap.content} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {fullScreenContent.type === "code" && (
              <div className="prose prose-invert h-[80vh] w-full overflow-y-auto">
                {content.codeSnippets.map((codeSnippet, index) => (
                  <div key={index} className="mb-8 relative">
                    <h2 className="text-2xl font-bold mb-4">
                      Code Snippet {index + 1}
                    </h2>
                    <SyntaxHighlighter
                      language={codeSnippet.language || "javascript"}
                      style={dark}
                    >
                      {codeSnippet.content}
                    </SyntaxHighlighter>
                    <RxClipboardCopy
                      onClick={() => handleCopy(codeSnippet.content)}
                      size={40}
                      color="white"
                      className="absolute top-4 right-2 px-2 py-1 text-neon-blue hover:transform hover:scale-110  transition-all"
                    />
                  </div>
                ))}
              </div>
            )}
            {fullScreenContent.type === "images" && (
              <div className="grid grid-cols-2 gap-4 h-[80vh] w-full overflow-y-auto">
                {content.images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="h-full w-full overflow-hidden relative"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Image ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </motion.div>
                ))}
              </div>
            )}
            {fullScreenContent.type === "videos" && (
              <div className=" w-full h-auto ">
                {content.videos.map((video, index) => (
                  <motion.div
                    key={index}
                    className="h-[50vh] w-full overflow-hidden mb-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Suspense fallback={<div className="animate-pulse" />}>
                      <ReactPlayer
                        url={video.url}
                        width="100%"
                        height="100%"
                        controls
                        className="shadow-lg"
                      />
                    </Suspense>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
});

export default DrawerContent;
