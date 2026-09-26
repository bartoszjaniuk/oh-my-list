import { ScrollView, ScrollViewProps } from "react-native";

export const BodyScrollView = (props: ScrollViewProps) => {
	return (
		<ScrollView
			automaticallyAdjustContentInsets={true}
			contentInsetAdjustmentBehavior="automatic"
			contentInset={{ bottom: 0 }}
			scrollIndicatorInsets={{ bottom: 0 }}
			{...props}
		/>
	);
};
