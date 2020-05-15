import firebase, { firestore } from "firebase";

// Your web app's Firebase configuration
var firebaseConfig = {
	apiKey: "AIzaSyBP6KqmQ1dav6Jo-aD7vmyTZrxLgRnTZH0",
	authDomain: "socially-distant-eats.firebaseapp.com",
	databaseURL: "https://socially-distant-eats.firebaseio.com",
	projectId: "socially-distant-eats",
	storageBucket: "socially-distant-eats.appspot.com",
	messagingSenderId: "236305920789",
	appId: "1:236305920789:web:f65fe22c8a7e5651216f1c"
};

firebase.initializeApp(firebaseConfig);

const data = {
	auth: firebase.auth(),
	db: firebase.firestore(),

	getUsersFavorites(user: firebase.User, addIfNotThere: boolean = false): Array<number> {
		if (user.email) {
			this.db
				.collection("users")
				.where("email", "==", user.email)
				.get()
				.then((snapshot: firebase.firestore.QuerySnapshot) => {
					if (!snapshot.empty) {
						snapshot.forEach((doc: firebase.firestore.DocumentData) => {
							console.log(doc, doc.data());
						});
					} else if() {
						
					}
				});
		}
		return [];
	}
};

export default data;
