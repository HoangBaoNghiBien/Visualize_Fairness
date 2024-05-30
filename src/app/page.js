import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./MapComponent/Map'), { ssr: false });
const Navbar = dynamic(() => import('./NavbarComponent/Navbar'), { ssr: false });
const Sidebar = dynamic(() => import('./InputComponent/Sidebar'), { ssr: false });

export default function Home() {
  return (
    <div className="main-container">
      <Navbar />
      <Sidebar />
      <Map />
    </div>
  );
}
