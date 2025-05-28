import React, { useRef, useCallback, useEffect } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import DrawerContent from "./DrawerContent.jsx"; // Assuming this is a separate component
const CustomDrawer = React.memo(
  ({ isOpen, onClose, content, nodeId, setLoading, children }) => {
    const panelGroupRef = useRef(null);

    useEffect(() => {
      if (panelGroupRef.current) {
        if (isOpen) {
          panelGroupRef.current.setLayout([55, 45]);
        } else {
          panelGroupRef.current.setLayout([100, 0]);
        }
      }
    }, [isOpen]);

    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    return (
      <section className="h-full overflow-hidden">
        <PanelGroup
          direction="horizontal"
          ref={panelGroupRef}
          autoSaveId="custom-drawer"
          className="h-full"
        >
          <Panel minSize={3} className="overflow-hidden">
            <main className="h-full">{children}</main>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent opacity-50 hover:opacity-100 transition-opacity duration-300" />

          <Panel
            minSize={0}
            collapsible
            onCollapse={handleClose}
            className="border-l-2 border-neon-blue/30 backdrop-blur-md transition-all"
          >
            <AnimatePresence>
             
              {isOpen && (
                <motion.div
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="h-full"
                >
                  
                  <DrawerContent
                    content={content}
                    onClose={handleClose}
                    setLoading={setLoading}
                    nodeId={nodeId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>
        </PanelGroup>
      </section>
    );
  }
);

CustomDrawer.displayName = "CustomDrawer";

export default CustomDrawer;
