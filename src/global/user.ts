import firebase from "firebase";
import data from "@/global/data";

const user = {
	isLoggedIn(forceSignup: boolean = false): Promise<firebase.User> {
		return new Promise((resolve, reject) => {
			data.auth.onAuthStateChanged((user: null | firebase.User) => {
				if (user) {
					resolve(user);
				} else if (forceSignup) {
					this.signup()
						.then((user: firebase.User) => {
							resolve(user);
						})
						.catch((error) => {
							reject(error);
						});
				} else {
					reject(null);
				}
			});
		});
	},

	signup(): Promise<firebase.User> {
		return new Promise((resolve, reject) => {
			var provider = new firebase.auth.FacebookAuthProvider();

			data.auth
				.signInWithPopup(provider)
				.then((result: any) => {
					var token = result.credential.accessToken;
					var user = result.user;
					resolve(user);
				})
				.catch((error: any) => {
					var errorCode = error.code;
					var errorMessage = error.message;
					var email = error.email;
					var credential = error.credential;
					reject(error);
				});
		});
	}
};

export default user;
