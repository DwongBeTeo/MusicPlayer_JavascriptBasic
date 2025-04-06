/*
1. render songs: done
2. Scroll top: done
3. Play/pause/seek: done
4.CD rotate: done
5. Next/ previous: done
6. Random: done
7. Next/repeat when ended: done
8. Active song: done
9. Scroll active song into view: done
10. play song when click:done
11. cần thêm 1 vài hiệu ứng khác: darkmode, favourite song, sreach, volume (https://trongnguyen10.github.io/music-player/)
12. cần fix 1 số lỗi: -load lại trang mất bài hát đang chạy(loadConFig) (https://trongnguyen10.github.io/music-player/)
*/
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8_STUDENT'
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $(".playlist");
//Xử lý CD để quay tròn và dừng
const cdThumbAnimate = cdThumb.animate([
  { transform: 'rotate(360deg)' }
],{
    duration:10000, //10second
    iterations:Infinity
  }
)
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function(key, value) {
    this.config[key]= value;
    localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
  },
  playedSongs: [],//Mảng chỉ lưu bài hát đã phát
  songs: [
    {
      name: "Nevada",
      singer: "vicetone",
      path: "./assets/music/Nevada.mp3",
      image: "./assets/img/nevada.jpg",
    },
    {
      name: "SummerTime",
      singer: "K",
      path: "./assets/music/391---summertime-sunshine-nsc-release.mp3",
      image: "./assets/img/summerTime.jpg",
    },
    {
      name: "Light It Up (feat. Jex)",
      singer: "Robin Hustin x TobiMorrow",
      path: "./assets/music/Light It Up.mp3",
      image: "./assets/img/light-it-up.jpg",
    },
    {
      name: "EM HÁT AI NGHE REMIX",
      singer: "KAIFO REMIX || NHẠC THỊNH HÀNH HOT TREND TIK TOK",
      path: "./assets/music/EM HÁT AI NGHE REMIX.mp3",
      image: "./assets/img/em-hat-ai-nghe.jpg",
    },
    {
      name: "Don’t Mind (Sickick Remix)",
      singer: "Kent Jones || Slowed + Reverb",
      path: "./assets/music/dont-mind-sickick-remix.mp3",
      image: "./assets/img/dont-mind.jpg",
    },
    {
      name: "Save Me (Audio)",
      singer: "DEAMN",
      path: "./assets/music/save-me-audio.mp3",
      image: "./assets/img/save-me.jpg",
    },
    {
      name: "Rude (Lyrics)",
      singer: "MAGIC!",
      path: "./assets/music/rude-lyrics.mp3",
      image: "./assets/img/rude.jpg",
    },
    {
      name: "Fight Back [Official Video]",
      singer: "NEFFEX",
      path: "./assets/music/fight-back-official-video-no37.mp3",
      image: "./assets/img/fight-back.jpg",
    },
    {
      name: "Cake By The Ocean (Lyrics)",
      singer: "DNCE",
      path: "./assets/music/cake-by-the-ocean-lyrics.mp3",
      image: "./assets/img/cake-by-the-ocean.jpg",
    },
  ],
  //Hàm này chịu trách nhiệm hiển thị danh sách bài hát (playlist) lên giao diện.
  render: function () {
    //this.songs:Là mảng chứa danh sách các bài hát, mỗi bài là một object
    //.map():Phương thức này lặp qua từng phần tử trong mảng songs và trả về một mảng
    // mới(htmls) chứa các chuỗi HTML đại diện cho từng bài hát.
    const htmls = this.songs.map((song, index) => {
      return `
      <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
        <div class="thumb" 
            style="background-image: url('${song.image}')">
        </div>
        <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
        </div>
        <div class="option">
            <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
        `;
    });
    //htmls.join(""): Chuyển mảng các chuỗi HTML thành một chuỗi duy nhất, loại bỏ dấu phẩy giữa các phần tử.
    //$(".playlist").innerHTML: Gán chuỗi HTML vào phần tử có class playlist trong DOM, từ đó hiển thị danh sách bài hát lên giao diện.
    playList.innerHTML = htmls.join("");
  },
  //Hàm này định nghĩa thuộc tính động currentSong cho object app
  defineProperties: function () {
    //Object.defineProperty: Tạo một thuộc tính mới (currentSong) trên object app (được trỏ bởi this).
    Object.defineProperty(this, 'currentSong', {
      //get: Định nghĩa một getter, nghĩa là mỗi khi bạn truy cập this.currentSong, hàm này sẽ chạy và trả về bài hát tại vị trí this.currentIndex trong mảng songs.
      get: function () {
        //this: Trong ngữ cảnh này, this trỏ đến object app, vì hàm được gọi trong app.start()
        //Mục đích: Thay vì lưu currentSong như một giá trị tĩnh, getter đảm bảo nó luôn phản ánh bài hát hiện tại dựa trên currentIndex
        return this.songs[this.currentIndex];
      },
    });
  },
  //Hàm này xử lý các sự kiện người dùng
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;
    //Mới vào thì CD dừng
    cdThumbAnimate.pause();
    //xử lý phóng to/thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //xử lý Khi bài hát được chạy
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    //xử lý Khi bài hát được dừng
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    //xử lý Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };
    //xử lý khi tua bài hát(seek)
    progress.oninput = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    //xử lý khi chuyển bài tiếp theo (next)
    nextBtn.onclick = function() {
      if (_this.isRandom) { //nếu bật random bài hát sẽ chuyển ngẫu nhiên
        _this.playRandomSong()
      }else{
        _this.nextSong();
      }
      audio.play(); //để phát nhạc ngay sau khi chuyển bài
      _this.updateActiveSong();
      _this.scrollToActiveSong();
    }
    //xử lý khi chuyển bài về trước (previous)
    prevBtn.onclick = function() {
      if (_this.isRandom) {//nếu bật random bài hát sẽ chuyển ngẫu nhiên
        _this.playRandomSong()
      }else{
        _this.prevSong();
      }
      audio.play(); //để phát nhạc ngay sau khi chuyển bài
      _this.updateActiveSong();
      _this.scrollToActiveSong();
    }
    //xử lý khi ấn nút random: bật/tắt
    randomBtn.onclick = function() {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom);
    }
    //Xử lý ấn nút lặp lại bài hát(repeat): bật/tắt
    repeatBtn.onclick = function() {
      _this.isRepeat= !this.isRepeat
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active',_this.isRepeat);
    }

    //Xử lý next song khi bài hát kết thúc
    // console.log(Object.getPrototypeOf(audio));
    audio.onended = function() {
      if (_this.isRepeat) {
        audio.play()
      }else {
        nextBtn.click();
      }
    }
    //xử lý hành vi click vào bài hát trong danh sách
    playList.onclick = function(e) {
      const songNode = e.target.closest('.song:not(.active)')

      if(songNode || e.target.closest('.option')) {
        //xử lý khi click vào song
        if(songNode) {
          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          _this.updateActiveSong()
          audio.play()
        }
        //xử lý khi click vào option
        if (e.target.closest('.option')) {
          
        }
      }
    }
  },
  //Hàm cuộn xuống bài hát đang chạy
  scrollToActiveSong: function() {
    setTimeout(() => {
      $('.playlist .song.active').scrollIntoView({
        behavior: "smooth",
        block: 'end',
        inline: 'nearest',
      })
    },300)
  },
  //Hàm này tải thông tin bài hát hiện tại lên giao diện và thẻ audio
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  //hàm loadConFig
  loadConfig: function() {
    this.isRandom=this.config.isRandom || false
    this.isRepeat=this.config.isRepeat || false 
    randomBtn.classList.toggle('active',this.isRandom);
    repeatBtn.classList.toggle('active',this.isRepeat);
  },
  //Hàm Chuyển bài tiếp theo
  nextSong: function() {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  //Hàm Chuyển ngược bài hát về trước
  prevSong: function() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  //Hàm nhấn nút random để chuyển bài hát ngẫu nhiên
  playRandomSong: function() {
    if(this.playedSongs.length >= this.songs.length){
      this.playedSongs=[];
    }
    let newIndex;
    do{
      newIndex= Math.floor(Math.random() * this.songs.length);
    }
    while(this.playedSongs.includes(newIndex) || newIndex === this.currentIndex)//Kiểm tra xem bài hát đã phát chưa
    this.playedSongs.push(newIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  //Hàm xử quản lý class 'active'
  updateActiveSong: function() {
    const songs = $$('.song');
    songs.forEach((song) => {
      if(Number(song.dataset.index) === this.currentIndex){
        song.classList.add('active')
      }else{
        song.classList.remove('active')
      }
    });
  },
  start: function () {
    //gán cấu hình từ config vào ứng dụng
    this.loadConfig();
    //Định nghĩa các thuộc tính cho object
    this.defineProperties();

    //lắng nghe sử lý các sự kiện
    this.handleEvents();

    //tải thông tin bài hát đầu tiền vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    //render lại playList
    this.render();
  },
};

app.start();
