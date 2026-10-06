import { Experience } from '@/components/Experience';
import { Book } from '@/components/sections/Book';
import { Care } from '@/components/sections/Care';
import { Cornea } from '@/components/sections/Cornea';
import { Difference } from '@/components/sections/Difference';
import { Hero } from '@/components/sections/Hero';
import { Iris } from '@/components/sections/Iris';
import { Lens } from '@/components/sections/Lens';
import { Retina } from '@/components/sections/Retina';
import { BlinkOverlay } from '@/components/ui/BlinkOverlay';
import { DepthMeter } from '@/components/ui/DepthMeter';
import { Footer } from '@/components/ui/Footer';
import { MobileDock } from '@/components/ui/MobileDock';
import { Nav } from '@/components/ui/Nav';

/**
 * The page is an eye; scrolling is how you look inside it.
 * All content is server-rendered semantic HTML — the 3D layer is a progressive enhancement.
 */
export default function Page() {
  return (
    <>
      <Nav />
      <DepthMeter />
      <main id="main">
        <Hero />
        <Cornea />
        <Iris />
        <Lens />
        <Difference />
        <Retina />
        <Care />
        <Book />
      </main>
      <Footer />
      <MobileDock />
      <BlinkOverlay />
      <Experience />
    </>
  );
}
