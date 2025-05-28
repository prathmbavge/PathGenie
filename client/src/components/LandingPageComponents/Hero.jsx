import { Spotlight } from "../ui/spotlight";
import { cn } from "../lib/utils";
import { TextGenerateEffect } from "../ui/text-generate-effect";
import SlideButton from "../Buttons/SlideButton";
import { GiMagicLamp } from "react-icons/gi";

const Hero = () => {
  return (
    <div className="pb-20 pt-[75px]">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="flex justify-center align-middle">
        <div className="max-w-[100vw]">
          <img
            src="/pathgenie.png"
            alt="Pathgenie"
            className="relative w-[240px] m-auto"
          />
          <TextGenerateEffect
            className="text-center md:text-5xl lg:text-6xl"
            words="Start Your Journey With Pathgenie"
          />

          <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text pb-8 text-[20px] font-bold text-transparent text-center">
            <i>Define Your Path, Achieve Your Goals!</i>
          </p>
          <p className="relative z-20 text-white  text-[20px] font-bold  text-center">
            Powered by Perplexity's Sonar API !
          </p>

          <div className="flex justify-center mt-8">
            <SlideButton
              text="Start Magic"
              icon={<GiMagicLamp size={30} />}
              type="button"
              style={{ width: "100vw", maxWidth: "250px" }}
              fullWidth={true}
              onClick={() => (window.location.href = "/register")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
