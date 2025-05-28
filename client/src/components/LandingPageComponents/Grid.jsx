import React from "react";
import { BentoGrid, BentoGridItem } from "../ui/BentoGrid";
import { gridItems, people } from "../data";
import { AnimatedTooltip } from "../ui/AnimatedTooltip";

/**
 * Renders a BentoGrid with a set of items that describe the key features of
 * the application, and a AnimatedTooltip component that displays a list of
 * people who have contributed to the project.
 *
 * @return {React.ReactElement} The rendered component.
 */
const Grid = () => {
  return (
    <section id="info">
      <BentoGrid>
        {gridItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <BentoGridItem
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              icon={<IconComponent />}
            />
          );
        })}
      </BentoGrid>
      <div className="flex flex-row items-center justify-center mb-1 w-full mt-10">
          <AnimatedTooltip items={people} />
        </div>
    </section>
  );
};

export default Grid;
