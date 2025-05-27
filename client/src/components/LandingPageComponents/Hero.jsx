import { Spotlight } from "../ui/spotlight";
import { cn } from "../lib/utils";
import { TextGenerateEffect } from "../ui/text-generate-effect";
import MagicButton from "../ui/MagicButton";

const Hero = () => {

  return (
    <div className="pb-20 pt-[75px]">
      <div>
        <Spotlight className={"top-36 -left-10 md:-left-32 md:-top-20 h-screen z-50"} fill="white" />
        <Spotlight className={"-top-60 -left-full h-[80vh] w-[100vw] md:-left-32 md:-top-20 z-100"} fill="yellow" />
        <Spotlight className={"top-28 left-[470px] h-[80vh] w-100vw] z-100"} fill="orange" />
      </div>

      <div className={cn("absolute inset-0", "[background-size:20px_20px]", "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]", "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]")} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="flex justify-center align-middle">
        <div className="max-w-[100vw]">
          <img src="/pathgenie.png" alt="Pathgenie" className="relative w-[240px] m-auto" />
          <TextGenerateEffect className="text-center md:text-5xl lg:text-6xl" words="Start Your Journey With Pathgenie" />
          <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-[20px] font-bold text-transparent text-center pt-1">
            <i>Define Your Path, Achieve Your Goals!</i>
          </p>

          {/* <MagicButton title="Sign In With Google" icon={<FaGoogle />} position="left" handleClick={handleGoogleLogin} />
          <br />
          <MagicButton title="Sign In With GitHub" icon={<FaGithub />} position="left" handleClick={handleGithubLogin} /> */}
        </div>
      </div>
    </div>
  );
};

export default Hero;
