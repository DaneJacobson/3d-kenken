class Timer {
    constructor() {
        const self = this;

        self._startTime = null;
        self._elapsedTime = 0;
        self._timerInterval = null;
    }

    getFormattedTime() {
        const self = this;

        // Create the formatted time string
        const minutes = Math.floor(self._elapsedTime / 60000);
        const seconds = Math.floor((self._elapsedTime % 60000) / 1000);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return formattedTime;
    }

    start() {
        const self = this;

        // Clear the old interval
        clearInterval(self._timerInterval);

        // Create a new interval for the timer
        self._startTime = Date.now();
        self._timerInterval = setInterval(() => {
            self._elapsedTime = Date.now() - self._startTime;
            self.updateDisplay();
        }, 1000);
    }

    stop() {
        const self = this;

        // Clear the previous interval if it exists
        clearInterval(self._timerInterval);
    }

    updateDisplay() {
        const self = this;

        // Update the display with the formatted elapsed time
        document.getElementById('timer').textContent = self.getFormattedTime();
    }
}

export { Timer };