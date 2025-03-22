
import { Banner } from "@/components/root/Banner";
import Navbar from "@/components/root/Navbar";
// import { auth, currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  // const { userId } = await auth();
  // const user = await currentUser();



  return (
    <div className="p-5">
      <Navbar />
      <Banner />
    </div>
  );
}
