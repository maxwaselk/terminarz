import { openDB } from 'idb';

const dbPromise = openDB('meetings-db', 1, {
    upgrade(db) {
        db.createObjectStore('meetings', {
            keyPath: 'id',
        });
    },
});

const meetingForm = document.getElementById('meetingForm');
const meetingList = document.getElementById('meetingList');
const editModal = document.getElementById('editModal');
const closeModalBtn = document.querySelector('.close-btn');
let currentEditId = null;

// Funkcja do zapisywania spotkań w IndexedDB
const saveMeetingToDB = async (meeting) => {
    const db = await dbPromise;
    await db.put('meetings', meeting);
};

// Funkcja do ładowania spotkań z IndexedDB
const loadMeetingsFromDB = async () => {
    const db = await dbPromise;
    return db.getAll('meetings');
};

// Dodaj spotkanie do listy
const addMeetingToList = (meeting) => {
    const li = document.createElement('li');
    li.setAttribute('data-id', meeting.id);
    li.innerHTML = `
        <div>
            <p><span>Imię i Nazwisko:</span> ${meeting.name}</p>
            <p><span>Data:</span> ${meeting.date}</p>
            <p><span>Godzina:</span> ${meeting.time}</p>
            <p><span>Cel Spotkania:</span> ${meeting.purpose}</p>
        </div>
        <div class="action-buttons">
            <button class="edit-btn" title="Edytuj Spotkanie"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" title="Usuń Spotkanie"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;
    meetingList.prepend(li);

    li.querySelector('.edit-btn').addEventListener('click', () => openEditModal(meeting));
    li.querySelector('.delete-btn').addEventListener('click', () => handleRemove(li, meeting.id));
};

// Funkcja do otwierania modalu edycji spotkania
const openEditModal = (meeting) => {
    currentEditId = meeting.id;
    document.getElementById('editName').value = meeting.name;
    document.getElementById('editDate').value = meeting.date;
    document.getElementById('editTime').value = meeting.time;
    document.getElementById('editPurpose').value = meeting.purpose;
    editModal.style.display = 'block';
};

// Funkcja do obsługi dodawania spotkań
meetingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const purpose = document.getElementById('purpose').value.trim();

    if (name && date && time && purpose) {
        const meeting = { id: Date.now(), name, date, time, purpose };
        addMeetingToList(meeting);
        await saveMeetingToDB(meeting); // Zapisz do IndexedDB
        meetingForm.reset();
    }
});

// Funkcja do zamykania modalu
closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Funkcja do usuwania spotkania
const handleRemove = (li, id) => {
    li.remove();
    // Usuń z IndexedDB
    const db = dbPromise;
    db.then(db => db.delete('meetings', id));
};

// Ładowanie spotkań z IndexedDB
const loadMeetings = async () => {
    const meetings = await loadMeetingsFromDB();
    meetings.forEach(meeting => addMeetingToList(meeting));
};

// Inicjalizacja aplikacji
loadMeetings();
