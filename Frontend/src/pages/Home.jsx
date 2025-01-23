import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { Link } from 'react-router-dom'; 
import Header from '../components/CustomerNavbar';
import vendingIcon from '../assets/vending-machine.png';  

const fetchCoordinatesByName = async (name) => {   
  try {     
    const response = await axios.get(       
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(         
        name       
      )}&key=${import.meta.env.VITE_GEOCODING}`     
    );     
    const { lat, lng } = response.data.results[0].geometry;     
    return { lat, lon: lng };   
  } catch (error) {     
    console.error('Error fetching coordinates:', error);   
  } 
};  

const Home = () => {   
  const navigate = useNavigate();   
  const [location, setLocation] = useState(null);   
  const [nearestVendingMachines, setNearestVendingMachines] = useState([]);   
  const [loadingLocation, setLoadingLocation] = useState(false);   
  const [locationName, setLocationName] = useState('');   
  const [dropdownOpen, setDropdownOpen] = useState(false);    

  useEffect(() => {     
    const checkAuth = async () => {       
      try {         
        const token = localStorage.getItem('authToken');         
        if (!token) {           
          navigate('/login');           
          return;         
        }          
        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/protected`, {           
          headers: {             
            Authorization: `Bearer ${token}`,           
          },         
        });         
        if(response.data.user.type === 'Admin'){           
          navigate('/admin/home');         
        }         
        console.log(response.data);       
      } catch (error) {         
        console.log(error);         
        navigate('/login');       
      }     
    };    

    checkAuth();   
  }, [navigate]);    

  const handleGetLocation = () => {     
    setLoadingLocation(true);     
    if (navigator.geolocation) {       
      navigator.geolocation.getCurrentPosition(         
        (position) => {           
          const { latitude, longitude } = position.coords;           
          setLocation({ latitude, longitude });            
          axios.post(`${import.meta.env.VITE_BACKEND}/get-nearest-vending-machines`, {             
            latitude,             
            longitude           
          })           
          .then((response) => {             
            console.log(response.data);             
            setNearestVendingMachines(response.data);           
          })           
          .catch((error) => {             
            console.error('Error fetching nearest vending machines:', error);           
          });            
          setLoadingLocation(false);         
        },         
        (error) => {           
          console.error('Error getting location:', error);           
          setLoadingLocation(false);         
        }       
      );     
    } else {       
      alert('Geolocation is not supported by this browser.');     
    }   
  };    

  const handleLocationInputChange = (event) => {     
    setLocationName(event.target.value);   
  };    

  const handleLocationSearch = async () => {     
    setLoadingLocation(true);     
    try {       
      const coordinates = await fetchCoordinatesByName(locationName);        

      if (coordinates) {         
        setLocation({           
          latitude: coordinates.lat,           
          longitude: coordinates.lon         
        });          
        axios.post(`${import.meta.env.VITE_BACKEND}/get-nearest-vending-machines`, {           
          latitude: coordinates.lat,           
          longitude: coordinates.lon         
        })         
        .then((response) => {             
          console.log(response.data);             
          setNearestVendingMachines(response.data);           
        })         
        .catch((error) => {             
          console.error('Error fetching nearest vending machines:', error);           
        });       
      }     
    } catch (error) {       
      console.error('Error fetching coordinates:', error);     
    }     
    setLoadingLocation(false);   
  };    

  return (     
    <>       
      <Header />
      <div className="bg-[#2E5077] p-6 rounded-t-lg mb-6 shadow-md">
          <h1 className="text-5xl font-bold text-white mb-2 text-center">
            Find Nearest Vending Machines
          </h1>
          <p className="text-xl text-white text-center">
            Locate the nearest vending machines easily
          </p>
        </div>       
      <div className="max-w-7xl mx-auto px-4 py-8 bg-[#F6F4F0] rounded-lg">         
        

        <button           
          onClick={() => setDropdownOpen(!dropdownOpen)}           
          className="w-full sm:w-auto text-white bg-[#4DA1A9] hover:bg-[#79D7BE] focus:ring-4 focus:ring-[#79D7BE] font-medium rounded-lg text-sm px-6 py-2.5 mb-6 block mx-auto transition-all ease-in-out duration-300"         
        >           
          {dropdownOpen ? 'Close Location Options' : 'Choose Location Method'}         
        </button>          

        {dropdownOpen && (           
          <div className="absolute z-20 mt-2 sm:w-auto bg-white shadow-lg rounded-md p-4 space-y-4 mx-auto left-0 right-0">             
            <button               
              type="button"               
              onClick={handleGetLocation}               
              disabled={loadingLocation}               
              className="w-50 text-white bg-[#4DA1A9] hover:bg-[#79D7BE] focus:ring-4 focus:ring-[#79D7BE] font-medium rounded-lg text-sm px-6 py-2.5"              
            >               
              {loadingLocation ? 'Fetching location...' : 'Use My Location'}              
            </button>              

            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 mb-4 justify-center">               
              <input                 
                type="text"                 
                value={locationName}                 
                onChange={handleLocationInputChange}                 
                placeholder="Enter a location name"                 
                className="w-full sm:w-64 p-3 border border-[#79D7BE] rounded-md focus:ring-[#4DA1A9]"               
              />               
              <button                 
                onClick={handleLocationSearch}                 
                disabled={loadingLocation}                 
                className="w-full sm:w-auto bg-[#79D7BE] text-white hover:bg-[#4DA1A9] focus:ring-4 focus:ring-[#4DA1A9] rounded-lg text-sm px-6 py-2.5 mt-4 sm:mt-0"               
              >                 
                Search Location               
              </button>              
            </div>           
          </div>         
        )}          

        {location ? (           
          <div className="mt-10">             
            <h2 className="text-lg font-semibold text-[#2E5077]">Nearest Vending Machines:</h2>             
            <ul className="mt-4 space-y-6">               
              {nearestVendingMachines.map((machine) => (                 
                <li key={machine._id} className="flex justify-between items-center p-5 bg-[#F6F4F0] hover:bg-[#E0E6E9] rounded-lg shadow-md transition-all ease-in-out duration-300">                   
                  <img 
                    src={vendingIcon} 
                    alt="Vending Machine" 
                    className="w-8 h-8 mr-4"                   
                  />                   
                  <div className="flex flex-col">                     
                    <Link to={`/machine/${machine._id}`} className="text-[#4DA1A9] hover:text-[#2E5077] font-semibold">                     
                      {machine.name}                   
                    </Link>                   
                    <span className="text-sm text-[#2E5077]">{machine.distance.toFixed(2)} km away</span>                 
                  </div>                   
                </li>               
              ))}             
            </ul>           
          </div>         
        ) : (           
          <p className="mt-5 text-gray-500">Location Required</p>         
        )}       
      </div>     
    </>   
  ); 
};  

export default Home;
