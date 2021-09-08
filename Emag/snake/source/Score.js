/**
 * The Game Score
 */
class Score {
    
    /**
     * The Game Score constructor
     * @param {Display} display
     */
    constructor(display) {
        this.levelNames   = [ "Easy", "Medium", "Hard", "Super" ];
        this.speedTimes   = [ 300, 200, 100, 50 ];
        this.countTime    = 500;
        this.initialCount = 4;
        
        this.display = display;
        this.scorer  = document.querySelector(".score");
        this.timer   = document.querySelector(".time");
        this.leveler = document.querySelector(".level");
        
        this._count  = 0;
        this._level  = 1;
        this._score  = 0;
        this._time   = 0;
    }
    
    
    /**
     * Returns the game count
     * @return {number}
     */
    get count() {
        return this._count;
    }
    
    /**
     * Returns the game level
     * @return {number}
     */
    get level() {
        return this._level;
    }
    
    /**
     * Returns the game score
     * @return {number}
     */
    get score() {
        return this._score;
    }
    
    /**
     * Returns the game time
     * @return {number}
     */
    get time() {
        return this._time;
    }
    
    
    /**
     * Sets the game level and score
     * @param {number}  level
     * @param {number=} score
     * @return {Score}
     */
    set(level, score) {
        this._count = this.initialCount;
        this._level = level;
        this._score = score || 0;
        this.resetTime();
        return this;
    }
    
    
    /**
     * Shows all the things
     */
    show() {
        this.showLevel();
        this.showScore();
        this.showFoodTimer();
    }
    
    /**
     * Shows the current level in the game view
     */
    showLevel() {
        this.leveler.innerHTML = "Level: " + this.levelNames[this.level - 1];
    }
    
    /**
     * Shows the score
     */
    showScore() {
        this.scorer.innerHTML = "Score: " + Utils.formatNumber(this.score, ",");
    }
    
    /**
     * Shows the food timer
     * @param {(string|number)=} timer
     */
    showFoodTimer(time) {
        this.timer.innerHTML = time || "";
    }
    
        
    /**
     * Decreases the Count by 1
     */
    decCount() {
        this._count -= 1;
    }
    
    /**
     * Increases the Score
     * @param {number} score
     */
    incScore(score) {
        this._score += score;
        this.showScore();
    }
    
    /**
     * Decreases the timer by the given amount
     * @param {number} time
     */
    decTime(time) {
        this._time -= time;
    }
    
    /**
     * Resets the timer
     */
    resetTime() {
        if (this.display.isStarting()) {
            this._time = this.countTime;
        } else {
            this._time = this.speedTimes[this.level - 1];
        }
    }
}
