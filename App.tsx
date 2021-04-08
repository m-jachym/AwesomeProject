import * as React from 'react';
import {
  StyleSheet,
  View,
  Button,
  PermissionsAndroid,
  NativeEventEmitter,
} from 'react-native';
// @ts-ignore
import RNApipay, { APCurrencyCode } from 'react-native-apipay';

const apipayModuleEmitter = new NativeEventEmitter(RNApipay);

export default function App() {
  const [showLoginButton, setShowLoginButton] = React.useState<boolean>(false);
  const [showLogoutButton, setShowLogoutButton] = React.useState<boolean>(
    false
  );

  React.useEffect(() => {
    apipayModuleEmitter.addListener(RNApipay.DISCOVERY, (data: any) => {
      console.log(`discoveryEvent: ${data}`);
    });

    apipayModuleEmitter.addListener(RNApipay.PAIRED_DEVICE, (data: any) => {
      console.log(`pairedDeviceEvent: ${data}`);
      if (data === 'PP0920900107') {
        pairDevice(data).then();
      }
    });

    apipayModuleEmitter.addListener(
      RNApipay.TRANSACTION_MONITOR,
      (data: any) => {
        console.log(`transactionMonitor: ${data}`);
      }
    );

    apipayModuleEmitter.addListener(
      RNApipay.TRANSACTION_PROGRESS,
      (data: any) => {
        console.log('transactionProgress:');
        console.log(data);
      }
    );

    apipayModuleEmitter.addListener(RNApipay.BLUETOOTH_STATE, (data: any) => {
      console.log(`bluetoothStateEvent: ${data}`);
    });

    canStartNewTransaction();
    defaultDevice();
    requestLocationPermission();
    silentLogin(setShowLoginButton, setShowLogoutButton);

    return () => {
      apipayModuleEmitter.removeAllListeners(RNApipay.DISCOVERY);
      apipayModuleEmitter.removeAllListeners(RNApipay.PAIRED_DEVICE);
      apipayModuleEmitter.removeAllListeners(RNApipay.TRANSACTION_MONITOR);
      apipayModuleEmitter.removeAllListeners(RNApipay.TRANSACTION_PROGRESS);
      apipayModuleEmitter.removeAllListeners(RNApipay.BLUETOOTH_STATE);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.margin}>
        <Button
          disabled={!showLoginButton}
          title="Login"
          onPress={() => onLoginPress(setShowLoginButton, setShowLogoutButton)}
        />
      </View>
      <View style={styles.margin}>
        <Button
          disabled={!showLogoutButton}
          title="Logout"
          onPress={() => onLogoutPress(setShowLoginButton, setShowLogoutButton)}
        />
      </View>
      <View style={styles.margin}>
        <Button
          title="Turn Bluetooth On"
          onPress={turnOnBluetoothIfNotAlreadyTurnedOn}
        />
      </View>
      <View style={styles.margin}>
        <Button title="Show User" onPress={showLoggedUser} />
      </View>
      <View style={styles.margin}>
        <Button title="Show Merchant" onPress={showMerchant} />
      </View>
      <View style={styles.margin}>
        <Button title="Start Discovery" onPress={startDiscovery} />
      </View>
      <View style={styles.margin}>
        <Button title="Cancel Discovery" onPress={cancelDiscovery} />
      </View>
      <View style={styles.margin}>
        <Button
          title="Start Sale Transaction"
          onPress={startNewSaleTransaction}
        />
      </View>
      <View style={styles.margin}>
        <Button title="Cancel Transaction" onPress={cancelCurrentTransaction} />
      </View>
    </View>
  );
}

const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Access granted');
    } else {
      console.log('Access denied');
    }
  } catch (error) {
    logError(error);
  }
};

const showLoggedUser = async () => {
  try {
    let loggedUser = await RNApipay.loggedUser();
    console.log(loggedUser);
  } catch (error) {
    logError(error);
  }
};

const showMerchant = async () => {
  try {
    let merchant = await RNApipay.merchant();
    console.log(merchant);
  } catch (error) {
    logError(error);
  }
};

const silentLogin = async (
  setShowLoginButton: React.Dispatch<React.SetStateAction<boolean>>,
  setShowLogoutButton: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let isUserLoggedIn = await RNApipay.isUserLoggedIn();
  console.log(`isUserLoggedIn: ${isUserLoggedIn}`);
  if (!isUserLoggedIn) {
    try {
      let user = await RNApipay.silentLoginUser();

      console.log(user);

      canStartNewTransaction();
      defaultDevice();

      setShowLoginButton(false);
      setShowLogoutButton(true);

      console.log('User logged in');
    } catch (error) {
      logError(error);

      setShowLoginButton(true);
      setShowLogoutButton(false);
    }
  }
};

const onLoginPress = async (
  setShowLoginButton: React.Dispatch<React.SetStateAction<boolean>>,
  setShowLogoutButton: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    let user = await RNApipay.loginUser('sebastian@deligoo.pl', 'FQeXN8AU');

    console.log(user);

    canStartNewTransaction();
    defaultDevice();

    setShowLoginButton(false);
    setShowLogoutButton(true);

    console.log('User logged in');
  } catch (error) {
    logError(error);

    setShowLoginButton(true);
    setShowLogoutButton(false);
  }
};

const onLogoutPress = async (
  setShowLoginButton: React.Dispatch<React.SetStateAction<boolean>>,
  setShowLogoutButton: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    await RNApipay.logoutUser();

    setShowLoginButton(true);
    setShowLogoutButton(false);

    console.log('User logged out');
  } catch (error) {
    logError(error);
  }
};

const startDiscovery = async () => {
  try {
    await RNApipay.startDiscovery();

    console.log('Discovery started');
  } catch (error) {
    logError(error);
  }
};

const cancelDiscovery = async () => {
  try {
    await RNApipay.cancelDiscovery();

    console.log('Discovery cancelled');
  } catch (error) {
    logError(error);
  }
};

const pairDevice = async (name: string) => {
  try {
    let device = await RNApipay.pairDevice(name, true);

    console.log(`Device paired: ${device}`);
  } catch (error) {
    logError(error);
  }
};

const canStartNewTransaction = async () => {
  try {
    let flag = await RNApipay.canStartNewTransaction();

    console.log(`canStartNewTransaction: ${flag}`);
  } catch (error) {
    logError(error);
  }
};

const defaultDevice = async () => {
  try {
    let device = await RNApipay.defaultDevice();

    console.log(`defaultDevice: ${device}`);
  } catch (error) {
    logError(error);
  }
};

const refreshDeviceParametrization = async () => {
  try {
    let refreshingStatus = await RNApipay.refreshDeviceParametrization();

    console.log(`refreshDeviceParametrization: ${refreshingStatus}`);
  } catch (error) {
    logError(error);
  }
};

const startNewSaleTransaction = async () => {
  try {
    let transaction = await RNApipay.startNewSaleTransaction(
      100,
      'Test transaction',
      APCurrencyCode.PLN
    );

    console.log('transaction:');
    console.log(transaction);

    // sendReceipt(transaction.localId, 'email@example.com');
  } catch (error) {
    logError(error);
  }
};

const sendReceipt = async (localTransactionId: string, email: String) => {
  try {
    await RNApipay.sendReceipt(localTransactionId, email);

    console.log('Receipt sent');
  } catch (error) {
    logError(error);
  }
};

const cancelCurrentTransaction = async () => {
  try {
    await RNApipay.cancelCurrentTransaction();

    console.log('Current transaction cancelled');
  } catch (error) {
    logError(error);
  }
};

const turnOnBluetoothIfNotAlreadyTurnedOn = async () => {
  try {
    await RNApipay.turnOnBluetoothIfNotAlreadyTurnedOn();

    console.log('Bluetooth turned on');
  } catch (error) {
    logError(error);
  }
};

const logError = (error: any) => {
  console.log(
    error,
    error.code,
    error.message,
    error.userInfo,
    error.nativeStackAndroid
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  margin: {
    marginTop: 15,
  },
});
