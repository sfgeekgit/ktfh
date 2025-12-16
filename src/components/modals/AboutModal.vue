<!-- ABOUT MODAL: About modal opened from the bottom info icon -->
<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <div class="header">
                <h2 style="margin: 0; color: #aaa; font-size: 20px;">The Choice Before Us</h2>
            </div>

                <p style="font-size: 14px; margin-top: 20px; text-align: center; color: #aaa;">
                    A game by <a href="https://nickshapiro.com" target="_blank" style="color: #2196F3; text-decoration: none; font-weight: bold;">Nick Shapiro</a>
                </p>
	    	</template>
	        <template v-slot:body>

            <div style="line-height: 1.6; color:#aaa;">
	    Win the game by unlocking 5 Wonders



    	     	<p style="font-size: 14px; color: #aaa; padding-top:10px;">
Race to build world changing AI before your rivals. But if anyone, including you, builds an unaligned AGI, humanity loses. As your company grows, the world comes to depend on your gifts, but also your restraint. Can you navigate the narrow path? As your creation gains strength you may notice the game misbehaving. Don't be alarmed. This is normal. Probably. 

		</p>
                <hr style="margin: 20px 0; border-color: #2196F3; opacity: 0.3;" />

                <p style="font-size: 14px; color: #aaa;">This game was created for the <a href="https://keepthefuturehuman.ai/" target="_blank" style="color: #2196F3; text-decoration: none;">Keep The Future Human Creative Contest</a> and won the Grand Prize. The contest challenged creators to explore ideas from Anthony Aguirre's essay on AI risks and the importance of maintaining human agency in an increasingly AI-driven world.</p>

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
import { ref } from "vue";
import Modal from "./Modal.vue";

const isOpen = ref(false);

function closeModal() {
    isOpen.value = false;
}

defineExpose({
    open() {
        isOpen.value = true;
    }
});
</script>

<style scoped>
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
</style>
