import { TextHoverEffect } from "../components/ui/TextHoverEffect";
import { PlaceholdersAndVanishInput } from "../components/ui/PlaceholdersAndVanishInput";

const Home = () => {
  return (
    <>
      <TextHoverEffect text="Pathgenie" duration={0} />
      <PlaceholdersAndVanishInput
        placeholders={[
          "Create a Mindmap on Artificial Intelligence",
          "Create a Mindmap on Web Development",
          "Create a Mindmap on Daily Routine",
        ]}
        onChange={(e) => console.log("changing", e.target.value)}
        onSubmit={(e) => console.log("submitted", e)}
      />
    </>
  );
};

export default Home;
