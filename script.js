let keyMap = {};
let keys = [];
let songs = [];
let currentAudio = null;

const loadKeys = async () => {
  const piano = document.getElementById('piano');
  keys.forEach((key) => {
    console.log(key);
    const keyElement = document.createElement('div');
    keyElement.classList.add('key');
    keyElement.id = key.id;

    if (key.isBlack) {
      keyElement.classList.add('black');
    }

    keyElement.textContent = key.label;
    piano.appendChild(keyElement);

    keyElement.addEventListener('click', () => {
      playsound(key);
    });
  });
};

const loadSongs = async () => {
  const listGroup = document.querySelector('#songs .list-group');

  songs.forEach((song) => {
    console.log(song);
    const listItem = document.createElement('li');
    listItem.textContent = song.title;
    listItem.classList.add('list-group-item');

    // Play-Button
    const playButton = document.createElement('button');
    playButton.textContent = 'Play';
    playButton.classList.add('btn', 'btn-primary', 'btn-sm', 'ml-2');

    // Füge Event-Listener für den Play-Button hinzu
    playButton.addEventListener('click', async () => {
      await togglePlayStop(song, playButton);
    });

    listGroup.appendChild(listItem);
    listItem.appendChild(playButton);
  });
};

const loadData = async () => {
  const response = await fetch('data.json');
  const data = await response.json();
  keyMap = data.keyMap;
  keys = data.keys;
  songs = data.songs;
  await loadKeys();
  await loadSongs();
};

const playsound = async (key) => {
  let audioFile = key.audioFile;

  if (!audioFile) {
    console.log(`Kein Audio für Note: ${key.label}`);
    return;
  }

  let audio = new Audio(audioFile);
  await audio.play();
};

const playsong = async (song) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = new Audio(song);
  await currentAudio.play();
};

const stopSong = async () => {
  if (currentAudio) {
    await currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

// Funktion zum Wechseln zwischen Play/Stop für den Button
const togglePlayStop = async (song, playButton) => {
  // Wenn ein Song läuft und der gleiche Button geklickt wird (Stoppen des aktuellen Songs)
  if (currentAudio) {
    if (playButton.textContent === 'Stop') {
      //Wenn der Song der gerade Läuft gestoppt werden soll
      await stopSong(); // Stoppe den Song
      playButton.textContent = 'Play'; // Setze den Button auf "Play"
      playButton.style.backgroundColor = ''; // Setze die Hintergrundfarbe zurück
    } else {
      //Es soll ein anderer song gespielt werden und das was gerade läuft soll gestoppt werden
      // Wenn der Play-Button eines anderen Songs geklickt wird
      const allButtons = document.querySelectorAll('.list-group-item button');
      allButtons.forEach((btn) => {
        btn.textContent = 'Play';
        btn.style.backgroundColor = ''; // Setze alle anderen Buttons zurück
      });

      // Starte das neue Lied
      await playsong(song.path);

      // Ändere den Text und die Farbe des aktuellen Buttons
      playButton.textContent = 'Stop';
      playButton.style.backgroundColor = 'red';
    }
  } else {
    // Wenn kein Song läuft, spiele das neue Lied
    await playsong(song.path);
    playButton.textContent = 'Stop';
    playButton.style.backgroundColor = 'red';
  }
};

document.addEventListener('keydown', async function (event) {
  const keyId = keyMap[event.key.toLowerCase()];

  if (keyId) {
    const keyElement = document.getElementById(keyId);
    keyElement.classList.add('active');

    const key = keys.find((a) => a.id == keyId);
    await playsound(key);
  }
});

document.addEventListener('keyup', async function (event) {
  const keyId = keyMap[event.key.toLowerCase()];
  if (keyId) {
    const keyElement = document.getElementById(keyId);
    keyElement.classList.remove('active');
  }
});

loadData();
