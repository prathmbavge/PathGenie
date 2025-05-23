import React, { useRef, useEffect, useCallback, Suspense, lazy, memo, useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
// import { Markmap } from 'markmap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiX, FiLink, FiImage, FiFilm, FiFileText, FiCode, FiMap } from 'react-icons/fi';

// Lazy-loaded components
const ReactPlayer = lazy(() => import('react-player/lazy'));

// Glow color palette
const glowStyles = {
  blue: 'border-neon-blue/70 hover:border-neon-blue shadow-neon-blue/20 hover:shadow-neon-blue/40',
  pink: 'border-neon-pink/70 hover:border-neon-pink shadow-neon-pink/20 hover:shadow-neon-pink/40',
  purple: 'border-neon-purple/70 hover:border-neon-purple shadow-neon-purple/20 hover:shadow-neon-purple/40'
};

const AccordionSection = memo(({ title, icon: Icon, glow, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      className={`group  backdrop-blur-lg ${glowStyles[glow]} transition-all duration-300`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
          {/* <Icon className="h-5 w-5 text-neon-blue" /> */}
          {Icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown className="h-5 w-5 text-neon-pink transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const DrawerContent = memo(({ content, onClose }) => {
  return (
    <aside className="flex h-full flex-col space-y-6 p-6 overflow-y-auto">
      <button
        onClick={onClose}
        className="sticky top-4 z-10 ml-auto flex items-center space-x-2  px-1 py-2 text-neon-pink backdrop-blur-lg transition-all hover:border-neon-pink hover:bg-neon-pink/20 hover:shadow-[0_0_15px_#ff0072]"
      >
        <FiX className="h-5 w-5" />
        <span>Close</span>
      </button>

      <div className="space-y-8 overflow-y-auto">
        {content.links?.length > 0 && (
          <AccordionSection title="Links" icon={FiLink} glow="blue">
            <ul className="space-y-3">
              {content.links.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className=" p-1 transition-colors hover:bg-white/5"
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
                    <p className="mt-1 text-sm text-gray-300">{link.description}</p>
                  )}
                </motion.li>
              ))}
            </ul>
          </AccordionSection>
        )}

        {content.markdown?.length > 0 && (
          <AccordionSection title="Markdown" icon={FiFileText} glow="pink">
            <div className="prose prose-invert max-h-[400px] overflow-y-auto">
             {content.markdown.map((markdown, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className=" p-1 transition-colors hover:bg-white/5"
                >
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {markdown.content}
                  </ReactMarkdown>
                </motion.div>
              ))}
            </div>
          </AccordionSection>
        )}
        {content.notes?.length > 0 && (
          <AccordionSection title="Notes" icon={FiFileText} glow="blue">
            <div className="prose prose-invert max-h-[400px] overflow-y-auto">
              {content.notes.map((note, index) => (
                <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className=" p-1 transition-colors hover:bg-white/5">
                  {note.content}
                </motion.div>
              ))}
            </div>
          </AccordionSection>
        )}

        {content.images?.length > 0 && (
          <AccordionSection title="Images" icon={FiImage} glow="purple">
            <div className="grid grid-cols-2 gap-4">
              {content.images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="relative overflow-hidden "
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
          </AccordionSection>
        )}

        {content.videos?.length > 0 && (
          <AccordionSection title="Videos" icon={FiFilm} glow="pink">
            <div className="space-y-4">
              {content.videos.map((video, index) => (
                <motion.div
                  key={index}
                  className="relative overflow-hidden "
                  whileHover={{ scale: 1.02 }}
                >
                  <Suspense fallback={<div className="h-40 animate-pulse" />}>
                    <ReactPlayer
                      url={video.url}
                      width="100%"
                      height="100%"
                      light={<div className="h-40 " />}
                      controls
                      className=" shadow-lg"
                    />
                  </Suspense>
                </motion.div>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* Add similar accordion sections for other content types */}
        
      </div>
    </aside>
  );
});

const CustomDrawer = memo(({ isOpen, onClose, content, children }) => {
  const panelGroupRef = useRef(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <section className="h-full overflow-hidden ">
      <PanelGroup
        direction="horizontal"
        ref={panelGroupRef}
        autoSaveId="custom-drawer"
        className="h-full"
      >
        <Panel minSize={40} className="overflow-hidden">
          <main className="h-full">{children}</main>
        </Panel>

        <PanelResizeHandle className="w-2 bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent opacity-50 hover:opacity-100 transition-opacity duration-300" />

        <Panel
          minSize={0}
          collapsible
          onCollapse={handleClose}
          className="border-l-2 border-neon-blue/30  backdrop-blur-md transition-all"
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <DrawerContent content={content} onClose={handleClose} />
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>
      </PanelGroup>
    </section>
  );
});

export default CustomDrawer;