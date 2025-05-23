import React, { useRef, useEffect, useCallback, Suspense, lazy, memo } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';

// Lazy-loaded React Player for videos
const ReactPlayer = lazy(() => import('react-player/lazy'));

const DrawerContent = memo(({ content, onClose }) => {
  const renderItem = useCallback(
    (item, index) => {
      switch (item.type) {
        case 'markdown':
          return (
            <article key={index} className="prose prose-invert">
              <ReactMarkdown>{item.markdown}</ReactMarkdown>
            </article>
          );
        case 'links':
          return (
            <nav key={index} aria-label="External links">
              <ul className="list-disc list-inside space-y-2">
                {item.url.map((link, li) => (
                  <li key={li}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-blue hover:text-neon-pink focus:outline focus:outline-neon-pink"
                      aria-label={`External link to ${link}`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          );
        case 'images':
          return (
            <section key={index} aria-label="Image gallery" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {item.url.map((src, img) => (
                <img
                  key={img}
                  src={src}
                  alt={item.description || `Image ${img + 1}`}
                  loading="lazy"
                  className="rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 focus:ring-4 focus:ring-offset-2 focus:ring-neon-pink"
                  tabIndex={0}
                />
              ))}
            </section>
          );
        case 'videoUrls':
          return (
            <section key={index} aria-label="Video gallery" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {item.url.map((video, v) => (
                <div
                  key={v}
                  className="relative pt-[56.25%] rounded-lg overflow-hidden shadow-lg focus-within:ring-4 focus-within:ring-neon-pink"
                  tabIndex={0}
                >
                  <Suspense fallback={<div className="text-center py-8">Loading video...</div>}>
                    <ReactPlayer
                      url={`https://www.youtube.com/watch?v=${video.split('=')[1]}`}
                      width="100%"
                      height="100%"
                      style={{ position: 'absolute', top: 0, left: 0 }}
                      controls
                      light
                    />
                  </Suspense>
                </div>
              ))}
            </section>
          );
        case 'note':
          return (
            <aside key={index} className="italic bg-neon-blue/10 p-4 rounded-lg" role="note">
              {item.description}
            </aside>
          );
        default:
          return null;
      }
    },
    []
  );

  return (
    <aside
      className="p-6 space-y-6 overflow-y-auto max-h-full scrollbar-thin scrollbar-thumb-neon-blue scrollbar-track-transparent"
      aria-live="polite"
    >
      <button
        onClick={onClose}
        aria-label="Close drawer"
        className="sticky top-4 px-4 py-2 bg-transparent border border-neon-pink/70 text-neon-pink rounded-lg hover:bg-neon-pink/20 hover:shadow-[0_0_10px_#ff0072] focus:outline-none focus:ring-4 focus:ring-neon-pink transition duration-300"
      >
        Close
      </button>

      {content?.length > 0 ? (
        <main className="space-y-8">{content.map(renderItem)}</main>
      ) : (
        <p className="text-gray-400 italic">No content available</p>
      )}
    </aside>
  );
});

const CustomDrawer = memo(({ isOpen, onClose, content, children }) => {
  const panelGroupRef = useRef(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (panelGroupRef.current) {
      const drawerSize = isOpen ? 30 : 0; // percentage
      const mainSize = 100 - drawerSize;
      panelGroupRef.current.setLayout([mainSize, drawerSize]);
    }
  }, [isOpen]);

  return (
    <section className="h-full text-white overflow-hidden" aria-label="Custom drawer container">
      <PanelGroup
        direction="horizontal"
        ref={panelGroupRef}
        autoSaveId="custom-drawer"
        className="h-full"
      >
        <Panel
          minSize={40}
          className="overflow-auto focus:outline-none focus:ring-4 focus:ring-neon-blue"
        >
          <main>{children}</main>
        </Panel>

        <PanelResizeHandle className="w-1 cursor-col-resize bg-gradient-to-r from-transparent to-neon-blue/50 hover:bg-neon-blue focus:outline-none focus:ring-4 focus:ring-neon-blue transition duration-300" />

        <Panel
          minSize={0}
          collapsible
          onCollapse={handleClose}
          className="backdrop-blur-md bg-black/20 border-l-4 border-neon-blue/50"
        >
          {isOpen && <DrawerContent content={content} onClose={handleClose} />}
        </Panel>
      </PanelGroup>
    </section>
  );
});

export default CustomDrawer;