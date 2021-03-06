import './HomePage.css';
import ActionBar from "../../component/action-bar/ActionBar";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {useState} from "react";
import MainWeatherCard from "../../component/main-weather-card/MainWeatherCard";
import {pushData, removeData} from "../../redux/FavoriteSlice";
import {useEffect} from "react";
import {FadeIn} from "react-slide-fade-in";

function HomePage(props) {

    const selector = useSelector((store) => store);
    const [defaultWeather, setDefaultWeather] = useState(0);
    const [fiveDaysWeather, setFiveDaysWeather] = useState([]);
    const [inFavorite, setInFavorite] = useState(false);
    const [dataForFavorite, setDataForFavorite] = useState([])
    const [head, setHead] = useState("");
    const [error, setError] = useState(false);
    const [id, setId] = useState("");
    const dispatch = useDispatch();


    function returnClassForBackgroundImage() {
        if (selector.darkMode.isOn) {
            return "main-container-dark-home";
        } else {
            return "main-container-light-home";
        }
    }

    useEffect(() => {
        return () => {
            setError(true)
        };
    }, [])

    async function getCityWeatherDataForFiveDays(id) {
        try {
            const data = await axios.get("http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + id + "?apikey=R8APxdI4JGLh8D0vu4Nf7cYKcCb0BFKH&details=true");
            setFiveDaysWeather(data.data.DailyForecasts);
            setHead(data.data.Headline.Category);
        } catch (e) {
            console.log(e)
        }

    }

    async function getDefaultWeather() {
        try {
            const data = await axios.get("http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=R8APxdI4JGLh8D0vu4Nf7cYKcCb0BFKH&q=32.14577077248564%2C%2034.702958497707336&details=true");
            const dataArray = data.data;
            const dataOfWeather = await axios.get("http://dataservice.accuweather.com/currentconditions/v1/" + dataArray.Key + "?apikey=R8APxdI4JGLh8D0vu4Nf7cYKcCb0BFKH");

            setDataForFavorite(dataOfWeather.data[0])
            if (selector.weatherDegree.isFOn) {
                setDefaultWeather(dataOfWeather.data[0].Temperature.Imperial.Value);
            } else {
                setDefaultWeather(dataOfWeather.data[0].Temperature.Metric.Value);
            }
            setId(dataArray.Key)

            await getCityWeatherDataForFiveDays(dataArray.Key);
        } catch (e) {
            console.log(e)
        }

    }

    async function addToFavorite() {
        try {
            const newFavorite = {key : id, desc : head, cValue : dataForFavorite.Temperature.Metric.Value + ' C \u00B0', fValue : dataForFavorite.Temperature.Imperial.Value + ' F \u00B0' , city : "tel-aviv"}
            dispatch(pushData(newFavorite))
            setInFavorite(true);
        } catch (e) {
            console.log(e)
        }
    }

    function removeFromFavorite() {
        dispatch(removeData(props.match.params.key))
        setInFavorite(false);
    }

    function checkIfInFavorite() {
        selector.favorite.data.forEach(favorite => {
            if (favorite.key === id) {
                setInFavorite(true);
            } else {
                setInFavorite(false)
            }
        })
    }



    useEffect(() => {
        getDefaultWeather().then();
        checkIfInFavorite();
    }, [defaultWeather, fiveDaysWeather, inFavorite])

    return(
        <div className={returnClassForBackgroundImage()}>
            <ActionBar isChecked={selector.darkMode.isOn} type={"home"}/>
            <FadeIn from={"top"} positionOffset={0} triggerOffset={0}  durationInMilliseconds={2000}>
                <div className={"inner-container"}>
                    <MainWeatherCard onClickRemove={removeFromFavorite} onClickAddFavorite={addToFavorite} isInFavorite={inFavorite} degree={defaultWeather} cityName={"Tel aviv"} fiveDays={fiveDaysWeather}/>
                </div>
            </FadeIn>

        </div>
    )
}

export default HomePage;