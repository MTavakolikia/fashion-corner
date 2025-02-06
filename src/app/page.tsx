
import HomeClient from "./HomeClient";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="p-5">
      <div className="w-100 flex gap-x-5 justify-end">
        <HomeClient userId={userId} />
      </div>
    </div>
  );
}
