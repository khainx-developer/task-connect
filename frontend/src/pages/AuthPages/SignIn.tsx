import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Task Manager | Efficient Task Organization & Tracking"
        description="Task Manager is a powerful tool designed to help users organize, track, and complete tasks efficiently with an intuitive dashboard."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
