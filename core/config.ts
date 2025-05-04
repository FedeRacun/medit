import { getUser } from "../utils/getUser";

export type UserConfig = {
	name?: string;
	email?: string;
};

export function getUserConfig() {
	const userConfig = getUser();

	if (!userConfig) {
		console.log("❌ User configuration not found.");
	} else {
		console.log("👤 User information:");
		console.log(`- Name: ${userConfig.name || "Not specified"}`);
		console.log(`- Email: ${userConfig.email || "Not specified"}`);
	}
}
