import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import logo from './assets/logo.png'
import SunCalc from "suncalc";

const App = () => {
  const [sahurTime, setSahurTime] = useState("");
  const [hadith, setHadith] = useState("");
  const [iftarTime, setIftarTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentCity, setCurrentCity] = useState(null);
  const [sahurCountdown, setSahurCountdown] = useState("");
  const [iftarCountdown, setIftarCountdown] = useState("");
  
  const cities = {
    Grimstad: { name: "Grimstad", lat: 58.33092, lon: 8.5771 },
    Oslo: { name: "Oslo", lat: 59.911491, lon: 10.757933 },
    Tromso : {name: "Tromsø", lat: 69.6489, lon: 18.95508},
    Skien : {name: "Skien", lat: 59.20962, lon: 9.60897},
    Porsgrunn : {name: "Porsgrunn", lat: 59.14054, lon: 9.6561},
    Drammen : {name: "Drammen", lat: 59.74389, lon: 10.20449},
  };

  const handleCitySelection = (e) => {
    console.clear();
    setCurrentCity(cities[e.target.value]);
  };

  const fetchSahur = (currentCity) => {
    const sahur = SunCalc.getTimes(new Date(), currentCity?.lat, currentCity?.lon).nightEnd.getTime() - (20 * 60 * 1000); // Sahur time - 20 dk for security
    const hours = new Date(sahur).getHours().toString().padStart(2, "0");
    const minutes = new Date(sahur).getMinutes().toString().padStart(2, "0");
    const seconds = new Date(sahur).getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };
  
  const fetchIftar = (currentCity) => {
    const iftar = SunCalc.getTimes(new Date(), currentCity?.lat, currentCity?.lon).sunset.getTime() + (5 * 60 * 1000); // Sahur time + 5 dk for security
    const hours = new Date(iftar).getHours().toString().padStart(2, "0"); 
    const minutes = new Date(iftar).getMinutes().toString().padStart(2, "0");
    const seconds = new Date(iftar).getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };
  

  const fetchRandomHadith = async () => {
    try {
      const randomHadithNumber =
        Math.floor(Math.random() * (1160 - 391 + 1)) + 391;
      const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/tur-bukhari/${randomHadithNumber}.json`;

      const response = await axios.get(url);
      const data = response.data;

      const hadith = data.hadiths[0].text;
      setHadith(hadith);
    } catch (error) {
      console.error("Error fetching random Hadith: ", error);
    }
  };

  const formatTime = (time) => {

    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, "0");
    const day = String(time.getDate()).padStart(2, "0");
    const hours = String(time.getHours()).padStart(2, "0");
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const seconds = String(time.getSeconds()).padStart(2, "0");
    const _time = `${hours}:${minutes}:${seconds}`
    const date = `${day}.${month}.${year}`

    return [date, _time];
  };

  function updateCurrentTime() {
    const interval = setInterval(() => {
      const now = new Date();
      const [date, time] = formatTime(now);
      setCurrentTime(time);
      setCurrentDate(date);
    }, 1000);
    
    return interval;
  }
  
  
  useEffect(() => {
    const intervalId = updateCurrentTime();
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    if (!currentCity) {
      setCurrentCity(cities.Grimstad);
      setSahurTime(fetchSahur(currentCity));
      setIftarTime(fetchIftar(currentCity));
    }
    
    setSahurTime(fetchSahur(currentCity));
    setIftarTime(fetchIftar(currentCity));
    fetchRandomHadith();
  }, [currentCity]);


  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
  
      const sahurTime = SunCalc.getTimes(now, currentCity?.lat, currentCity?.lon).nightEnd.getTime() - (20 * 60 * 1000);
      const iftarTime = SunCalc.getTimes(now, currentCity?.lat, currentCity?.lon).sunset.getTime() + (5 * 60 * 1000);
  
      let sahurDifference = sahurTime - now.getTime();
      let iftarDifference = iftarTime - now.getTime();
  
      if (sahurDifference < 0) {
        sahurDifference += 24 * 60 * 60 * 1000; 
      }
      if (iftarDifference < 0) {
        iftarDifference += 24 * 60 * 60 * 1000;
      }
  
      const formatTimeDifference = (difference) => {
        const hours = Math.floor(difference / (1000 * 60 * 60)).toString().padStart(2, "0");
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
        const seconds = Math.floor((difference % (1000 * 60)) / 1000).toString().padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
      };
  
      setSahurCountdown(formatTimeDifference(sahurDifference));
      setIftarCountdown(formatTimeDifference(iftarDifference));
    };
  
    const interval = setInterval(() => {
      calculateCountdown();
    }, 1000);
  
    return () => clearInterval(interval);
  }, [currentCity]);
  

  return (
    <div className="App">
      <main>
      <div className="w-full flex flex-wrap flex-col place-items-center mt-12">
        
      <img src={logo} className="mb-12" alt="vaktul-ramazan-logo" width={200} />
      <div className="text-xl font-normal">{currentDate}</div>
      <div className="text-xl font-normal">{currentTime}</div>
        <select
          onChange={(e) => handleCitySelection(e)}
          className="w-50 bg-slate-100 p-2 border-black mt-5"
        >
          {Object.keys(cities).map((city, key) => (
            <option key={key} value={city}>
              {cities[city].name}
            </option>
          ))}
        </select>

        <h1 className="text-xl font-normal mt-3">Sahur (-20 dk):</h1>
        <div><strong>{sahurCountdown}</strong> ({sahurTime})</div>
        <h1 className="text-xl font-normal mt-3">Iftar (+5 dk):</h1>
        <div><strong>{iftarCountdown}</strong> ({iftarTime})</div>
        <h3 className="mt-10 mb-5">Hadis:</h3>
        <div className="font-light w-96 text-xs">{hadith}</div>
        </div>
      </main>
    </div>
  );
};

export default App;
