import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import * as Location from 'expo-location';
import axios from 'react-native-axios';
import { API_KEY } from '@env';


export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchLocation}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (location) {
      const { latitude, longitude } = location.coords;
      fetchWeatherData(latitude, longitude);
    }
  }, [location]);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location || !weatherData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const temperature = weatherData.main.temp;
  const textColor = temperature > 30 ? '#d80032' : '#ff9505';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather App</Text>

      <Text style={styles.locationText}>
        Location: {weatherData.name}, {weatherData.sys.country}
      </Text>

      <Text style={[styles.weatherText, { color: textColor }]}>
        Temperature: {temperature}°C
      </Text>

      <Text style={styles.weatherText}>
        Weather: {weatherData.weather[0].description}
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Enter a location"
        value={searchLocation}
        onChangeText={setSearchLocation}
      />

      <Button title="Search" onPress={handleSearch} style={styles.searchBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#42a5f5",
  },
  locationText: {
    fontSize: 28,
    marginBottom: 10,
    color: "#00296b"
  },
  weatherText: {
    fontSize: 26,
    marginBottom: 5,
    color : "#ff9505"
  },
  searchInput: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  }
});
