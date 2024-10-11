document.addEventListener('DOMContentLoaded', () => {
    const meetingForm = document.getElementById('meetingForm');
    const meetingList = document.getElementById('meetingList');
    const editModal = document.getElementById('editModal');
    const closeModalBtn = editModal.querySelector('.close-btn');
    const editForm = document.getElementById('editForm');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const body = document.body;
    const notification = document.getElementById('notification');

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    let currentEditId = null;
    let meetingToDelete = null;

    // Sprawdzenie i żądanie uprawnień do powiadomień
    if ('Notification' in window && 'serviceWorker' in navigator) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Uprawnienia do powiadomień przyznane.');
                navigator.serviceWorker.ready.then(registration => {
                    messaging.useServiceWorker(registration);
                });
            }
        });
    }

    // Funkcja do wczytania spotkań z LocalStorage
    const loadMeetings = () => {
        renderMeetingList();
    };

    // Funkcja do zapisywania spotkań w LocalStorage
    const saveMeetings = (meetings) => {
        localStorage.setItem('meetings', JSON.stringify(meetings));
    };

    // Funkcja dodająca spotkanie do listy w UI
    const addMeetingToList = (meeting) => {
        const li = document.createElement('li');
        li.setAttribute('data-id', meeting.id);

        const detailsDiv = document.createElement('div');
        detailsDiv.innerHTML = `
            <p><span>Imię i Nazwisko:</span> ${meeting.name}</p>
            <p><span>Data:</span> ${formatDate(meeting.date)}</p>
            <p><span>Godzina:</span> ${meeting.time}</p>
            <p><span>Cel Spotkania:</span> ${meeting.purpose}</p>
        `;

        const actionButtons = document.createElement('div');
        actionButtons.classList.add('action-buttons');

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edytuj Spotkanie';
        editBtn.addEventListener('click', () => openEditModal(meeting));

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Usuń Spotkanie';
        deleteBtn.addEventListener('click', () => {
            handleRemove(meeting);
        });

        actionButtons.appendChild(editBtn);
        actionButtons.appendChild(deleteBtn);

        li.appendChild(detailsDiv);
        li.appendChild(actionButtons);
        meetingList.prepend(li); // Dodaje nowe spotkania na górę listy

        // Dodanie wydarzenia do kalendarza
        addEventToCalendar(meeting);

        // Ustawienie powiadomienia
        scheduleNotification(meeting);
    };

    // Funkcja usuwająca spotkanie z LocalStorage
    const removeMeeting = (id) => {
        let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings = meetings.filter(m => m.id !== id);
        saveMeetings(meetings);
    };

    // Obsługa dodawania nowego spotkania
    meetingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const purpose = document.getElementById('purpose').value.trim();

        if (validateForm(name, date, time, purpose)) {
            const meeting = {
                id: Date.now(),
                name,
                date,
                time,
                purpose
            };

            addMeetingToList(meeting);
            let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
            meetings.push(meeting);
            saveMeetings(meetings);

            // Resetowanie formularza
            meetingForm.reset();

            // Wyświetlenie powiadomienia
            showNotification('Spotkanie zostało dodane pomyślnie!', 'success');
        } else {
            showNotification('Wystąpił błąd podczas dodawania spotkania.', 'error');
        }
    });

    // Funkcja otwierająca modal do edycji spotkania
    const openEditModal = (meeting) => {
        currentEditId = meeting.id;
        document.getElementById('editName').value = meeting.name;
        document.getElementById('editDate').value = meeting.date;
        document.getElementById('editTime').value = meeting.time;
        document.getElementById('editPurpose').value = meeting.purpose;
        editModal.style.display = 'block';
        editModal.setAttribute('aria-hidden', 'false');
    };

    // Funkcja zamykająca modal
    const closeEditModal = () => {
        editModal.style.display = 'none';
        editForm.reset();
        currentEditId = null;
        editModal.setAttribute('aria-hidden', 'true');
    };

    // Obsługa zamykania modalu
    closeModalBtn.addEventListener('click', closeEditModal);
    window.addEventListener('click', (e) => {
        if (e.target == editModal) {
            closeEditModal();
        }
    });

    // Obsługa edycji spotkania
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('editName').value.trim();
        const date = document.getElementById('editDate').value;
        const time = document.getElementById('editTime').value;
        const purpose = document.getElementById('editPurpose').value.trim();

        if (validateForm(name, date, time, purpose)) {
            let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
            const meetingIndex = meetings.findIndex(m => m.id === currentEditId);
            if (meetingIndex !== -1) {
                meetings[meetingIndex] = {
                    id: currentEditId,
                    name,
                    date,
                    time,
                    purpose
                };
                saveMeetings(meetings);
                updateMeetingInUI(meetings[meetingIndex]);
                updateEventInCalendar(meetings[meetingIndex]);
                closeEditModal();

                // Wyświetlenie powiadomienia
                showNotification('Spotkanie zostało zaktualizowane pomyślnie!', 'success');
            }
        } else {
            showNotification('Wystąpił błąd podczas edytowania spotkania.', 'error');
        }
    });

    // Funkcja aktualizująca spotkanie w interfejsie użytkownika
    const updateMeetingInUI = (meeting) => {
        const li = meetingList.querySelector(`li[data-id='${meeting.id}']`);
        if (li) {
            const detailsDiv = li.querySelector('div');
            detailsDiv.innerHTML = `
                <p><span>Imię i Nazwisko:</span> ${meeting.name}</p>
                <p><span>Data:</span> ${formatDate(meeting.date)}</p>
                <p><span>Godzina:</span> ${meeting.time}</p>
                <p><span>Cel Spotkania:</span> ${meeting.purpose}</p>
            `;
            // Aktualizacja wydarzenia w kalendarzu
            updateEventInCalendar(meeting);
            // Opcjonalnie: odświeżenie powiadomień
            scheduleNotification(meeting);
        }
    };

    // Funkcja formatowania daty
    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateStr);
        return date.toLocaleDateString('pl-PL', options);
    };

    // Funkcja walidująca formularz
    const validateForm = (name, date, time, purpose) => {
        const errors = [];

        if (name.length < 3) {
            errors.push('Imię i nazwisko musi mieć co najmniej 3 znaki.');
        }

        if (!isValidDate(date)) {
            errors.push('Data musi być poprawna i nie może być w przeszłości.');
        }

        if (!isValidTime(time)) {
            errors.push('Godzina musi być poprawna.');
        }

        if (purpose.length < 5) {
            errors.push('Cel spotkania musi mieć co najmniej 5 znaków.');
        }

        if (errors.length > 0) {
            // showNotification(errors.join('\n'), 'error');
            alert(errors.join('\n'));
            return false;
        }

        return true;
    };

    // Funkcja sprawdzająca, czy data jest poprawna i nie jest w przeszłości
    const isValidDate = (dateStr) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const meetingDate = new Date(dateStr);
        return meetingDate >= today;
    };

    // Funkcja sprawdzająca, czy godzina jest poprawna
    const isValidTime = (timeStr) => {
        return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(timeStr);
    };

    // Funkcja ustawiająca powiadomienia
    const scheduleNotification = (meeting) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
            const now = new Date();
            const timeDifference = meetingDateTime - now - (15 * 60 * 1000); // Powiadomienie 15 minut przed spotkaniem

            if (timeDifference > 0) {
                setTimeout(() => {
                    showNotification(`Przypomnienie: Spotkanie z ${meeting.name} o ${meeting.time} (${meeting.purpose})`, 'info');
                }, timeDifference);
            }
        }
    };

    // Funkcja obsługująca animację usuwania
    const handleRemove = (meeting) => {
        openConfirmDeleteModal(meeting);
    };

    // Funkcja otwierająca modal potwierdzenia usunięcia
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    const openConfirmDeleteModal = (meeting) => {
        meetingToDelete = meeting;
        confirmDeleteModal.style.display = 'block';
        confirmDeleteModal.setAttribute('aria-hidden', 'false');
    };

    const closeConfirmDeleteModal = () => {
        confirmDeleteModal.style.display = 'none';
        meetingToDelete = null;
        confirmDeleteModal.setAttribute('aria-hidden', 'true');
    };

    // Obsługa potwierdzenia usunięcia
    confirmDeleteBtn.addEventListener('click', () => {
        if (meetingToDelete) {
            const li = meetingList.querySelector(`li[data-id='${meetingToDelete.id}']`);
            if (li) {
                li.classList.add('fade-out');
                setTimeout(() => {
                    li.remove();
                    removeMeeting(meetingToDelete.id);
                    removeEventFromCalendar(meetingToDelete.id);
                    showNotification('Spotkanie zostało usunięte pomyślnie!', 'success');
                }, 300);
            }
            closeConfirmDeleteModal();
        }
    });

    // Obsługa anulowania usunięcia
    cancelDeleteBtn.addEventListener('click', closeConfirmDeleteModal);

    // Obsługa zamykania modalu potwierdzenia usunięcia
    const closeButtons = confirmDeleteModal.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeConfirmDeleteModal);
    });

    // Obsługa wyszukiwania spotkań
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const meetings = meetingList.querySelectorAll('li');

        meetings.forEach(meeting => {
            const name = meeting.querySelector('p:nth-child(1)').textContent.toLowerCase();
            const date = meeting.querySelector('p:nth-child(2)').textContent.toLowerCase();
            const time = meeting.querySelector('p:nth-child(3)').textContent.toLowerCase();
            const purpose = meeting.querySelector('p:nth-child(4)').textContent.toLowerCase();

            if (name.includes(query) || date.includes(query) || time.includes(query) || purpose.includes(query)) {
                meeting.style.display = 'flex';
            } else {
                meeting.style.display = 'none';
            }
        });
    });

    // Funkcja sortowania spotkań
    const sortMeetings = (meetings, criteria) => {
        switch (criteria) {
            case 'date-asc':
                return meetings.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
            case 'date-desc':
                return meetings.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
            case 'name-asc':
                return meetings.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return meetings.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return meetings;
        }
    };

    // Funkcja do renderowania listy spotkań
    const renderMeetingList = () => {
        meetingList.innerHTML = '';
        let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        const sortCriteria = sortSelect.value;
        meetings = sortMeetings(meetings, sortCriteria);
        meetings.forEach(meeting => addMeetingToList(meeting));
    };

    // Obsługa zmiany kryterium sortowania
    sortSelect.addEventListener('change', renderMeetingList);

    // Inicjalizacja FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pl',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },
        events: getCalendarEvents(),
        eventColor: '#4a90e2',
        eventTextColor: '#fff',
    });
    calendar.render();

    // Funkcja do konwersji spotkań na format wydarzeń FullCalendar
    function getCalendarEvents() {
        const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        return meetings.map(meeting => ({
            id: meeting.id.toString(),
            title: `${meeting.name} - ${meeting.purpose}`,
            start: `${meeting.date}T${meeting.time}`,
            allDay: false,
        }));
    }

    // Funkcja dodająca wydarzenie do kalendarza
    const addEventToCalendar = (meeting) => {
        calendar.addEvent({
            id: meeting.id.toString(),
            title: `${meeting.name} - ${meeting.purpose}`,
            start: `${meeting.date}T${meeting.time}`,
            allDay: false,
        });
    };

    // Funkcja aktualizująca wydarzenie w kalendarzu
    const updateEventInCalendar = (meeting) => {
        const event = calendar.getEventById(meeting.id.toString());
        if (event) {
            event.setProp('title', `${meeting.name} - ${meeting.purpose}`);
            event.setStart(`${meeting.date}T${meeting.time}`);
        }
    };

    // Funkcja usuwająca wydarzenie z kalendarza
    const removeEventFromCalendar = (id) => {
        const event = calendar.getEventById(id.toString());
        if (event) {
            event.remove();
        }
    };

    // Przełączanie motywu
    const toggleTheme = () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    };

    // Obsługa kliknięcia na przycisk przełączania motywu
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Funkcja do załadowania motywu przy uruchomieniu
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    };

    // Załaduj motyw przy uruchomieniu
    loadTheme();

    // Funkcja do wyświetlania powiadomień
    const showNotification = (message, type = 'success') => {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Ukryj powiadomienie po 3 sekundach
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };

    // Obsługa powiadomień push z Firebase
    messaging.onMessage((payload) => {
        console.log('Otrzymano wiadomość:', payload);
        showNotification(payload.notification.body, 'info');
    });

    // Subskrybuj użytkownika do powiadomień push
    const subscribeUserToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY')
            });
            console.log('Subscribed to push:', subscription);
            // Prześlij subskrypcję do serwera (np. Firebase)
            // Możesz użyć fetch API do wysłania subskrypcji do backendu
        } catch (error) {
            console.error('Błąd podczas subskrypcji push:', error);
        }
    };

    // Funkcja do konwersji klucza VAPID
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Subskrybuj użytkownika do push powiadomień po załadowaniu strony
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        subscribeUserToPush();
    }

    // Obsługa dodawania spotkania do listy i kalendarza
    const renderMeetingList = () => {
        meetingList.innerHTML = '';
        let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        const sortCriteria = sortSelect.value;
        meetings = sortMeetings(meetings, sortCriteria);
        meetings.forEach(meeting => addMeetingToList(meeting));
    };

    loadMeetings();
});