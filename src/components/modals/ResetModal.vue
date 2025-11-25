<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <div class="header">
            </div>
        </template>
        <template v-slot:body>
            <div>
                <button class="reset-button" @click="confirmReset()">Reset Game</button>
                <p style="font-size: 12px; color: #2196F3; opacity: 0.8; margin-top: 10px;">This will delete all progress and start over from the beginning.</p>

                <hr style="margin: 20px 0; border-color: #2196F3; opacity: 0.3;" />

                <div v-if="props.isDev" style="margin-top: 15px;">
                    <h3 style="color: #2196F3; font-size: 14px; margin-bottom: 10px;">Dev Tools</h3>
                    <button class="dev-button" @click="devToChapter4()">Dev to Chap 4</button>
                    <button class="dev-button" @click="resetAutoTrainings()" style="margin-top: 8px;">Reset Auto Trainings</button>
                    <button class="dev-button" @click="resetWonders()" style="margin-top: 8px;">Reset Wonders</button>
                </div>
            </div>
        </template>
        <template v-slot:footer>
            <div class="modal-default-footer">
                <div class="modal-default-flex-grow"></div>
                <button class="close-button" @click="closeModal">
                    Close
                </button>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="tsx">
import { ref, withDefaults, defineProps } from "vue";
import Modal from "./Modal.vue";
import player from "game/player";
import { layers } from "game/layers";
import { save } from "util/save";
import { resetGame } from "util/reset";

const props = withDefaults(defineProps<{ isDev?: boolean }>(), {
    isDev: true
});

const isOpen = ref(false);

function closeModal() {
    isOpen.value = false;
    if (player.devSpeed === 0) {
        player.devSpeed = null;
    }
}

function confirmReset() {
    if (confirm("Are you sure you want to reset the game? This will delete ALL progress and cannot be undone!")) {
        resetGame();
    }
}

function devToChapter4() {
    const main = layers.main as any;
    if (main) {
        main.autonomy.value = 1;
        main.currentChapter.value = 4;
        player.frameworkChoice = "not_yet";
        player.gameOver = false;

        if (main.chapter5CompletionTime) main.chapter5CompletionTime.value = null;
        if (main.timeSinceChapter5) main.timeSinceChapter5.value = 0;
        if (main.activeNewsFlashes) main.activeNewsFlashes.value = [];
        if (main.dismissedNewsIds) main.dismissedNewsIds.value = [];

        const chapter5Layer = layers.chapter5 as any;
        if (chapter5Layer) {
            if (chapter5Layer.complete) chapter5Layer.complete.value = false;
            if (chapter5Layer.currentPage) chapter5Layer.currentPage.value = 0;
            if (chapter5Layer.playerChoice) chapter5Layer.playerChoice.value = null;
        }

        // @ts-ignore
        player.tabs = ["main"];
        save();
    }
    isOpen.value = false;
}

function resetAutoTrainings() {
    const main = layers.main as any;
    if (main) {
        const autoTrainingIds = ["trun_auto1", "trun_auto2", "trun_auto3", "trun_auto4"];

        if (main.spawnedOnetimeJobs) {
            main.spawnedOnetimeJobs.value = main.spawnedOnetimeJobs.value.filter((id: string) =>
                !autoTrainingIds.includes(id)
            );
        }
        if (main.completedOnetimeJobs) {
            main.completedOnetimeJobs.value = main.completedOnetimeJobs.value.filter((id: string) =>
                !autoTrainingIds.includes(id)
            );
        }
        if (main.unlockedJobTypes) {
            main.unlockedJobTypes.value = main.unlockedJobTypes.value.filter((id: string) =>
                !autoTrainingIds.includes(id)
            );
        }
        if (main.everVisibleJobTypes) {
            main.everVisibleJobTypes.value = main.everVisibleJobTypes.value.filter((id: string) =>
                !autoTrainingIds.includes(id)
            );
        }
        if (main.jobQueue) {
            main.jobQueue.value = main.jobQueue.value.filter((job: any) =>
                !autoTrainingIds.includes(job.jobTypeId)
            );
        }
        if (main.activeDeliveries) {
            main.activeDeliveries.value = main.activeDeliveries.value.filter((delivery: any) =>
                !autoTrainingIds.includes(delivery.jobTypeId)
            );
        }

        save();
    }
    isOpen.value = false;
}

function resetWonders() {
    const main = layers.main as any;
    if (main) {
        const wonderIds = ["wonder1", "wonder2", "wonder3", "wonder4", "wonder5"];

        // Set wonder score to 3
        if (main.wonder) {
            main.wonder.value = 3;
        }

        // Reset wonder jobs from all tracking arrays
        if (main.spawnedOnetimeJobs) {
            main.spawnedOnetimeJobs.value = main.spawnedOnetimeJobs.value.filter((id: string) =>
                !wonderIds.includes(id)
            );
        }
        if (main.completedOnetimeJobs) {
            main.completedOnetimeJobs.value = main.completedOnetimeJobs.value.filter((id: string) =>
                !wonderIds.includes(id)
            );
        }
        if (main.unlockedJobTypes) {
            main.unlockedJobTypes.value = main.unlockedJobTypes.value.filter((id: string) =>
                !wonderIds.includes(id)
            );
        }
        if (main.everVisibleJobTypes) {
            main.everVisibleJobTypes.value = main.everVisibleJobTypes.value.filter((id: string) =>
                !wonderIds.includes(id)
            );
        }
        if (main.jobQueue) {
            main.jobQueue.value = main.jobQueue.value.filter((job: any) =>
                !wonderIds.includes(job.jobTypeId)
            );
        }
        if (main.activeDeliveries) {
            main.activeDeliveries.value = main.activeDeliveries.value.filter((delivery: any) =>
                !wonderIds.includes(delivery.jobTypeId)
            );
        }

        save();
    }
    isOpen.value = false;
}

defineExpose({
    confirmReset,
    open() {
        isOpen.value = true;
    }
});
</script>

<style>
.reset-button {
    background: #f44336;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.reset-button:hover {
    opacity: 0.8;
}

.close-button {
    background: #4CAF50;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.close-button:hover {
    opacity: 0.9;
}

.modal-default-footer {
    display: flex;
}

.modal-default-flex-grow {
    flex-grow: 1;
}

.dev-button {
    background: #9C27B0;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    display: block;
    width: 100%;
}

.dev-button:hover {
    opacity: 0.9;
}
</style>
