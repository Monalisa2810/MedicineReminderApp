import AsyncStorage from "@react-native-async-storage/async-storage";

export const registerUser = async (name, email, password, age, blood) => {
  const existing = await AsyncStorage.getItem("users");
  const users = existing ? JSON.parse(existing) : [];
  const alreadyExists = users.find((u) => u.email === email.toLowerCase());
  if (alreadyExists)
    throw new Error("An account with this email already exists.");
  const newUser = { name, email: email.toLowerCase(), password, age, blood };
  users.push(newUser);
  await AsyncStorage.setItem("users", JSON.stringify(users));
  await AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
};

export const loginUser = async (email, password) => {
  const existing = await AsyncStorage.getItem("users");
  const users = existing ? JSON.parse(existing) : [];
  const user = users.find(
    (u) => u.email === email.toLowerCase() && u.password === password,
  );
  if (!user) throw new Error("Incorrect email or password.");
  await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  return user;
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem("currentUser");
};

export const getCurrentUser = async () => {
  const data = await AsyncStorage.getItem("currentUser");
  return data ? JSON.parse(data) : null;
};
