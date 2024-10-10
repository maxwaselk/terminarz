import { openDB } from 'idb';

// Otwarcie bazy IndexedDB
const dbPromise = openDB('meetings-db', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('meetings')) {
            db.createObjectStore('meetings', { keyPath: 'id' });
        }
    },
});

// Pobranie elementów z DOM
const meetingForm = document.getElementById('meetingForm');
const meetingList = document.getElementById('meetingList');
let currentEditId = null;

// Funkcja do dodania spotkania do listy w UI
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

    // Dodajemy obsługę edycji i usuwania
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
    document.getElementById('editModal').style.display = 'block';
};

// Funkcja do dodawania spotkania do IndexedDB
const saveMeetingToDB = async (meeting) => {
    try {
        const db = await dbPromise;
        await db.put('meetings', meeting);
        console.log("Spotkanie zapisane w IndexedDB:", meeting);
    } catch (error) {
        console.error("Błąd podczas zapisywania spotkania:", error);
    }
};

// Funkcja do usuwania spotkania z IndexedDB
const handleRemove = async (li, id) => {
    li.remove();
    try {
        const db = await dbPromise;
        await db.delete('meetings', id);
        console.log("Spotkanie usunięte z IndexedDB:", id);
    } catch (error) {
        console.error("Błąd podczas usuwania spotkania:", error);
    }
};

// Funkcja do dodawania spotkania z formularza
meetingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Pobieramy wartości z formularza
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const purpose = document.getElementById('purpose').value.trim();

    // Walidacja danych
    if (!name || !date || !time || !purpose) {
        alert("Proszę wypełnić wszystkie pola formularza.");
        return;
    }

    // Tworzymy obiekt spotkania
    const meeting = {
        id: Date.now(),
        name,
        date,
        time,
        purpose
    };

    // Dodajemy spotkanie do listy
    addMeetingToList(meeting);

    // Zapisujemy spotkanie do IndexedDB
    await saveMeetingToDB(meeting);

    // Resetujemy formularz
    meetingForm.reset();
});

// Funkcja do ładowania spotkań z IndexedDB przy starcie
const loadMeetings = async () => {
    try {
        const db = await dbPromise;
        const meetings = await db.getAll('meetings');
        meetings.forEach(meeting => addMeetingToList(meeting));
        console.log("Załadowano spotkania z IndexedDB:", meetings);
    } catch (error) {
        console.error("Błąd podczas ładowania spotkań:", error);
    }
};

// Inicjalizacja aplikacji i ładowanie spotkań
loadMeetings();
