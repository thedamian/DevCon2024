import { useState, useRef } from "react";
import { Text, View, TouchableOpacity, SafeAreaView, Image, Button, Modal, StyleSheet } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { Feather, FontAwesome6, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { uploadPicture } from "./post.js";

export default function App() {
  const [foodList, setFoodList] = useState([]);
  const [shoppingTotal, setShoppingTotal] = useState(0);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const cameraRef = useRef(null);
  const [pictureUri, setPictureUri] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    content: null,
    onConfirm: () => {},
  });

  const ConfirmationModal = () => (
    <Modal animationType="slide" transparent={true} visible={modalConfig.visible}
      onRequestClose={() =>
        setModalConfig((prev) => ({ ...prev, visible: false }))
      }
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {modalConfig.content}
          <View style={styles.buttonContainer}>
            <MaterialIcons name="cancel" size={60} color="#f77070"
              onPress={() =>
                setModalConfig((prev) => ({ ...prev, visible: false }))
              }
            />
            <AntDesign name="checkcircle" size={55} color="#8dc88d" 
            onPress={() => {
                modalConfig.onConfirm();
                setModalConfig((prev) => ({ ...prev, visible: false }));
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const showAddConfirmation = (result, uri) => {
    setModalConfig({
      visible: true,
      content: (
        <>
          <Text style={styles.modalText}>
            {result.food} average price is ${result.price}
          </Text>
          <Image source={{ uri: uri }} style={styles.previewImage} />
        </>
      ),
      onConfirm: () => {
        const newItem = { ...result, imageUri: uri };
        const newFoodList = [...foodList, newItem];
        setFoodList(newFoodList);
        const additionalPrice = Number(result.price);
        const newTotal = parseFloat(shoppingTotal) + additionalPrice;
        setShoppingTotal(newTotal.toFixed(2));
      }
    });
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setShowCamera(false);
        setPictureUri(photo.uri);
        const result = await uploadPicture(photo.uri);
        if (result.food === "unknown" || result.price === "unknown") {
          return;
        }
        setAnalysisResult(result);
        showAddConfirmation(result, photo.uri);
      } catch (error) {
        console.error("Error taking or uploading picture:", error);
      } 
    }
  };


  if (showCamera) {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="Grant Permission" />
        </View>
      );
    }

    return (
      <Camera style={styles.camera} type={cameraType} ref={cameraRef}>
        <View style={styles.cameraIcons}>
          <TouchableOpacity onPress={() => setShowCamera(false)}>
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.pictureButton} onPress={takePicture}></TouchableOpacity>
          <TouchableOpacity onPress={() => setCameraType((prev) => (prev === CameraType.back ? CameraType.front : CameraType.back))}>
            <FontAwesome6 name="arrows-rotate" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
       
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "#dfe4ea",
  },
  text: {
    fontSize: 23,
    color: "#35374B",
  },
  cartApp: {
    fontSize: 35,
    alignSelf: "flex-start",
    marginVertical: 10,
    fontWeight: 700,
    color: "#786DAE",
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.8,
    shadowRadius: 0.5,
    elevation: 1,
    margin: 20,
  },
  total: {
    fontSize: 35,
    color: "#35374B",
    fontWeight: 300,
    margin: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    shadowOpacity: 0.2,
  },
  foodListContainer: {
    position: "relative",
    flex: 1,
    width: 350,
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    margin: 20,
  },
  titleList: {
    fontSize: 21,
    fontWeight: 500,
    marginVertical: 20,
    color: "lightgray",
  },
  resetButton: {
    alignSelf: "flex-end",
    backgroundColor: "#968ec0",
    borderRadius: 15,
    position: "absolute",
    right: -25,
  },
  foodItemContainer: {
    width: "100%",
    padding: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#35374B",
    borderBottomColor: "lightgray",
    borderBottomWidth: 1,
    fontSize: 20,
  },
  deleteButton: {
    padding: 10,
  },
  emptyText: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    margin: 30,
  },
  iconButton: {
    padding: 10,
    borderRadius: 20,
    width: 60,
    height: 60,
    backgroundColor: "#968ec0",
    justifyContent: "center",
    alignItems: "center",
    margin: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
  },
  modalText: {
    fontSize: 18,
    color: "#35374B",
    textAlign: "center",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    margin: 10,
  },
  camera: {
    flex: 1,
  },
  cameraIcons: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginBottom: 60,
  },
  pictureButton: {
    padding: 10,
    borderRadius: 30,
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  previewImage: {
    width: 250,
    height: 250,
    margin: 20,
  },
});