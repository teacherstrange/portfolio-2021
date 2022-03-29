import { gsap } from 'gsap'
import Experience from '../../Experience.js'

export default class CharacterIntervals {

    leftDesktopIntervalDuration = 12

    constructor() {
        // Define 
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.mouse = this.experience.world.landingPage.mouse
        this.messagePopUp = this.experience.world.landingPage.messagePopUp
        this.desktops = this.experience.world.landingPage.desktops
        this.sounds = this.experience.sounds
        this.face = this.experience.world.character.face
        this.animations = this.experience.world.character.animations
    }

    /**
     * Blink
     */

    initBlink() {
        this.blink = {
            intervalDuration: 5,
            phases: [
                this.resources.items.characterBlink0Face,
                this.resources.items.characterBlink1Face,
                this.resources.items.characterBlink0Face
            ],
            allowedMaps: [
                this.face.textures.default,
                this.face.textures.sleepy,
            ]
        }

        this.startBlinking()
    }

    startBlinking() {
        this.blink.interval = () => gsap.delayedCall(this.blink.intervalDuration, () => {
            this.blink.currentMap = this.face.material.map

            //prevent overwriting of face texture
            if (this.blink.allowedMaps.includes(this.blink.currentMap)) {
                //define animation calls
                for (let i = 0; i < this.blink.phases.length + 1; i++) {
                    gsap.delayedCall((i * 60) / 1000, () => {
                        if (this.face.material.map == this.blink.phases[i - 1] || i == 0) {
                            //next face texture, set to current map when finished
                            this.face.material.map = i < this.blink.phases.length - 1 ? this.blink.phases[i] : this.blink.currentMap
                        }
                    })
                }
            }

            //Repeat
            this.blink.interval()
        })
        //Init
        this.blink.interval()
    }

    // play idle animation and start scroll and left desktop action interval
    idle() {
        this.animation = this.experience.world.character.animations

        if (this.animation.actions.current._clip.name === 'wave')
            this.animation.play('idle')

        // start intervals 
        this.scrollInterval()
        this.leftDesktopInterval()
    }

    // scroll desktop 0 if idle is playing
    // repeat interval afterwards
    scrollInterval() {
        //Start delayed call
        this.scrollIntervalCall = gsap.delayedCall((Math.random() * 2) + 3, () => {
            if (this.experience.ui.landingPage.visible) {
                if (this.animation.actions.current._clip.name == 'idle') {
                    //Scroll
                    this.desktops.scrollDesktop0()

                    //Perform double scroll
                    if (Math.random() <= 0.33) {
                        setTimeout(() => this.desktops.scrollDesktop0(), 700)
                    }
                }
            }
            //Repeat
            this.scrollInterval()
        })
    }

    // play left desktop action, show message pop up in room and repeat interval afterwards 
    leftDesktopInterval() {
        this.leftDesktopIntervalCall = gsap.delayedCall(this.leftDesktopIntervalDuration + this.animation.actions.leftDesktopAction._clip.duration + (Math.random() * 4), () => {
            if (this.experience.ui.landingPage.visible) {
                //Animation
                gsap.delayedCall(.18, () => this.animation.play('leftDesktopAction', .3))

                //Pop Up Animation
                this.messagePopUp.show()

                //Type sound
                setTimeout(() => this.sounds.play('longKeyboard'), 1700)

                // play idle afterwards 
                gsap.delayedCall(this.animation.actions.leftDesktopAction._clip.duration, () => {
                    this.animation.play('idle', .35)
                })
            }
            this.leftDesktopInterval()
        })
    }

    update() {
        if (this.experience.ui.landingPage.visible && (this.animations.actions.current._clip.name === 'idle' || this.animations.actions.current._clip.name === 'left-desktop-action'))
            this.mouse.updateMouseSync()
    }
}