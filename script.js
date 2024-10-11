document.addEventListener('DOMContentLoaded', () => {
    const meetingForm = document.getElementById('meetingForm');
    const meetingList = document.getElementById('meetingList');
    const editModal = document.getElementById('editModal');
    const closeModalBtn = document.querySelector('.close-btn');
    const editForm = document.getElementById('editForm');
    const searchInput = document.getElementById('searchInput');
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const body = document.body;

    let currentEditId = null;

    // Sprawdzenie i żądanie uprawnień do powiadomień
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Uprawnienia do powiadomień przyznane.');
                }
            });
        }
    }

    // Funkcja do wczytania spotkań z LocalStorage
    const loadMeetings = () => {
        const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings.forEach(meeting => addMeetingToList(meeting));
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
            handleRemove(li, meeting.id);
        });

        actionButtons.appendChild(editBtn);
        actionButtons.appendChild(deleteBtn);

        li.appendChild(detailsDiv);
        li.appendChild(actionButtons);
        meetingList.prepend(li); // Dodaje nowe spotkania na górę listy

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
                closeEditModal();
            }
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
                    new Notification('Przypomnienie o spotkaniu', {
                        body: `Spotkanie z ${meeting.name} o ${meeting.time} w dniu ${formatDate(meeting.date)}.\nCel: ${meeting.purpose}`,
                        icon: '/terminarz/icons/icon-192x192.png' // Ścieżka do ikony
                    });
                }, timeDifference);
            }
        }
    };

    // Funkcja obsługująca animację usuwania
    const handleRemove = (li, id) => {
        li.classList.add('fade-out');
        setTimeout(() => {
            li.remove();
            removeMeeting(id);
        }, 300);
    };

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

    // Obsługa przełączania motywu
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        // Zmiana ikony przycisku
        if (body.classList.contains('dark-theme')) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });

    // Przechowywanie preferencji motywu w LocalStorage
    const loadTheme = () => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    };

    const saveTheme = () => {
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    };

    // Aktualizacja LocalStorage przy przełączaniu motywu
    themeToggleBtn.addEventListener('click', saveTheme);

    // Załaduj motyw przy uruchomieniu
    loadTheme();

    // Obsługa ładowania spotkań przy uruchomieniu
    loadMeetings();
});