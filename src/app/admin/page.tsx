import { redirect } from "next/navigation";

/** Short alias — same console as `/casa-admin`. */
export default function AdminShortLinkPage() {
  redirect("/casa-admin");
}
