import { SignUp } from "@clerk/nextjs";
export default function Test() {
  return <SignUp unsafeMetadata={{ role: "staff" }} />;
}
