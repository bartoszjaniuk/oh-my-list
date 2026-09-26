import { Form } from "./components/Form";
import { useSignIn } from "./hooks/useSignIn";

export const SignInScreen = () => {
	const signIn = useSignIn();
	return <Form {...signIn} />;
};
