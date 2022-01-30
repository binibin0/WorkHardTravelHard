import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color";
import { FontAwesome } from "@expo/vector-icons";

export default function App() {
  const STORAGE_KEY_TODOS = "@toDos";
  const STORAGE_KEY_WORKING = "@working";

  const [loading, setLoading] = useState(true);

  const [working, setWorking] = useState(true);

  const [text, setText] = useState("");

  const [toDos, setToDos] = useState({});

  const [toDoBoxCheck, setToDoBoxCheck] = useState(false);

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadFromAsyncStorage();
  }, []);

  const work = () => {
    //
    setWorking(true);
    const workStatus = { working: !working };
    saveToAsyncStorage(STORAGE_KEY_WORKING, workStatus);
  };
  const travel = () => {
    //
    setWorking(false);
    const workStatus = { working: !working };
    saveToAsyncStorage(STORAGE_KEY_WORKING, workStatus);
  };

  const onChangeText = (payload) => setText(payload);

  const saveToAsyncStorage = async (StorageKey, toSave) => {
    await AsyncStorage.setItem(StorageKey, JSON.stringify(toSave));
  };

  const loadFromAsyncStorage = async () => {
    const checkToDos = await AsyncStorage.getItem(STORAGE_KEY_TODOS);
    if (checkToDos !== null) {
      const s = await AsyncStorage.getItem(STORAGE_KEY_TODOS);
      setToDos(JSON.parse(s));
    }
    const checkWorking = await AsyncStorage.getItem(STORAGE_KEY_WORKING);
    if (checkWorking !== null) {
      const s = AsyncStorage.getItem(STORAGE_KEY_WORKING);
      setWorking(JSON.parse(s).working);
    }
    setLoading(false);
  };

  const addToDo = async () => {
    //
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, toDoBoxCheck, editMode },
    };
    setToDos(newToDos);
    await saveToAsyncStorage(STORAGE_KEY_TODOS, newToDos);
    setText("");
  };

  const checkToDoBox = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].toDoBoxCheck = !toDoBoxCheck;
    setToDoBoxCheck(!toDoBoxCheck);
    await saveToAsyncStorage(STORAGE_KEY_TODOS, newToDos);
  };

  const editToDo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].editMode = !editMode;
    setEditMode(!editMode);
    setToDos(newToDos);
    await saveToAsyncStorage(STORAGE_KEY_TODOS, newToDos);
  };

  const changeTextInput = async (text, key) => {
    const newToDos = { ...toDos };
    newToDos[key].text = text;
    setEditMode(!editMode);
    await saveToAsyncStorage(STORAGE_KEY_TODOS, newToDos);
  };

  const deleteToDo = (key) => {
    Alert.alert(
      //
      "Delete To-Do",
      "Are you sure?",
      [
        { text: "Cancel" },
        {
          text: "Ok",
          onPress: async () => {
            const currentToDos = { ...toDos };
            delete currentToDos[key];
            const newToDos = currentToDos;
            setToDos(newToDos);
            await saveToAsyncStorage(STORAGE_KEY_TODOS, newToDos);
          },
        },
      ]
    );
  };

  return loading ? (
    <View style={styles.loadingView}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              fontSize: 44,
              color: working ? theme.white : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 44,
              color: !working ? theme.white : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          //
          style={styles.input}
          returnKeyType="done"
          placeholder={working ? "Add a To-do" : "Where do you want to go?"}
          onChangeText={onChangeText}
          value={text}
          onSubmitEditing={addToDo}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View key={key} style={styles.toDo}>
              <View style={styles.toDoBoxText}>
                <TouchableOpacity onPress={() => checkToDoBox(key)}>
                  {toDos[key].toDoBoxCheck ? (
                    <FontAwesome name="check-square" size={24} color={theme.white} />
                  ) : (
                    <FontAwesome name="square" size={24} color={theme.white} />
                  )}
                </TouchableOpacity>

                {toDos[key].editMode ? (
                  <TextInput
                    style={styles.editToDoInput}
                    value={toDos[key].text}
                    onChangeText={(text) => changeTextInput(text, key)}
                    onSubmitEditing={() => editToDo(key)}
                    returnKeyType="done"
                  />
                ) : (
                  <Text
                    style={{
                      ...styles.toDoText,
                      textDecorationLine: toDos[key].toDoBoxCheck ? "line-through" : "none",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                )}
              </View>
              <View style={styles.toDoEditDelete}>
                <TouchableOpacity onPress={() => editToDo(key)}>
                  <FontAwesome style={styles.toDoEdit} name="pencil" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.9} onPress={() => deleteToDo(key)}>
                  <Text style={styles.toDoDeleteBtn}>
                    <FontAwesome name="trash-o" size={26} color={theme.white} />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingView: {
    //
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.bg,
  },
  loadingText: {
    //
    color: theme.white,
    fontSize: 20,
  },

  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 80,
  },
  input: {
    backgroundColor: theme.white,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical: 16,
  },
  toDo: {
    //
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.grey,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
  },
  toDoBoxText: {
    //
    flexDirection: "row",
  },
  toDoText: {
    //
    color: theme.white,
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 14,
  },
  toDoEditDelete: {
    //
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editToDoInput: {
    //
    backgroundColor: theme.white,
    width: 230,
    height: 24,
    borderRadius: 6,
    paddingLeft: 4,
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "500",
  },
  toDoEdit: {
    //
    marginHorizontal: 10,
  },

  toDoDeleteBtn: {},
});
