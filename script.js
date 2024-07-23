let currentSong = new Audio()
let songs
let curFolder
async function getsongs(folder){
    curFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/Spotify/${folder}/`)
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response
    let as = div.getElementsByTagName('a')
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith('.mp3')){
            songs.push(element.href.split(`/${curFolder}/`)[1].split(".")[0])
        }
        
    }
    let song = document.querySelector(".recent-song")
    song.innerHTML = ""
    for(const s of songs){
        song.innerHTML += `<div class="liked">
                        <img src="images/like.png" alt="" width="13%">
                        <div class="lsong">
                            <span>${s.replaceAll("%20", " ")}</span>
                        </div>
                        </div>` 
        
    }
    
    document.querySelectorAll(".lsong span").forEach(e=>{
        e.addEventListener("click", element=>{
            playMusic(e.innerHTML)
        })
        
    })
    return songs
}
function convertSecondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
}


const playMusic = (track, pause=false)=>{
//    let audio = new Audio() 
   currentSong.src = `/Spotify/${curFolder}/` + track + ".mp3"
   if(!pause){
    currentSong.play()
    play.src = "images/pause.svg"
   }
   document.querySelector(".songInfo").innerHTML = (decodeURI(track)).split("-")[0]
   document.querySelector(".time").innerHTML = "00:00/00:00"

}
async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/Spotify/songs/`)
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let episodes = document.querySelector(".episodes")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if(e.href.includes("/songs/")){
            let folder = (e.href.split("/").slice(-2)[1]);
            //Get metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/Spotify/songs/${folder}/info.json`)
            let response = await a.json()
            episodes.innerHTML += `<div data-folder="${folder}" class="card">
                        <img src="songs/${folder}/cover.jpeg" alt="" width="95%">
                        <span>${response.title}</span>
                        <span>${response.description}</span>
                        <div class="play">
                            <img src="images/play.svg" alt="" width="55%">
                        </div>
                    </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        
        e.addEventListener("click", async item=>{
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}
async function main(){
    //getting list of songs
    await getsongs("songs/english")
    playMusic(songs[0], true)

    //Display all albums on the page
    displayAlbums()

    //Attach an event listener to play next and back
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "images/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "images/play.svg"
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".time").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)}/${convertSecondsToMinutes(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%"
    })

    //Add an event listener to playbar
    document.querySelector(".down").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration*percent)/100
    })

    //add event listener for hamburger
    document.querySelector(".ham").addEventListener("click", e=>{
        document.querySelector(".left").style.left = "0"
        document.querySelector(".right").style.width = "100vw"
    })

    document.querySelector(".cross").addEventListener("click", e=>{
        document.querySelector(".left").style.left = "-110%"
        document.querySelector(".right").style.width = "100vw"
        
        const mediaQuery = window.matchMedia('(min-width: 1150px)')

        if (mediaQuery.matches) {
            document.querySelector(".left").style.left = "0%"
            // document.querySelector(".right").style.width = "100vw"
        }

    })
     // Add an event listener to handle changes in the media query
     const mediaQuery = window.matchMedia('(min-width: 1150px)');
     mediaQuery.addEventListener('change', e => {
         if (e.matches) {
             document.querySelector(".left").style.left = "0%";
             document.querySelector(".right").style.width = "100vw";
         } else {
             // Handle case when media query no longer matches
             document.querySelector(".left").style.left = "-110%";
             document.querySelector(".right").style.width = "100vw";
         }
     });

     //add event listener to next and previous
     next.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].split(".")[0])
        if((index+1)<=songs.length-1){
            playMusic(songs[index+1])
        }
     })
     back.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].split(".")[0])
        if((index-1)>=0){
            playMusic(songs[index-1])
        }
     })

     //Add an event to volume
     document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentSong.volume = parseInt(e.target.value)/100
     })

    //Add event listener to mute the track
     document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
     })

}
main()