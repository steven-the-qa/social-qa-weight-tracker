<script setup lang="ts">
    import { doc, serverTimestamp, collection, DocumentReference, CollectionReference, addDoc} from "firebase/firestore";
    import { db } from '../firebase'
    import { getAuth } from 'firebase/auth'
    const user = getAuth().currentUser
    import { ref, reactive } from 'vue';
    import NumberInput from './NumberInput.vue';

    interface WeightEntry {
        unit: 'lb' | 'kg';
        weight: number;
        createdDate: Date;
    }

    const currentWeight = ref<number | null>(null)
    const weightUnit = ref<'lb' | 'kg'>('lb')
    const state = reactive({ currentWeight, weightUnit })

    const isOpen = ref(false)

    const handleDialog = () => {
        isOpen.value = !isOpen.value
    }

    const closeDialog = () => {
        isOpen.value = false
    }

    const handleSubmit = async () => {
        try {
            if (user == null || currentWeight.value == null) return

            const userRef: DocumentReference = doc(db, 'users', user.uid)
            const weightEntriesRef: CollectionReference = collection(userRef, 'weightEntries')

            const newWeightEntry: WeightEntry = {
                weight: currentWeight.value || 0,
                unit: state.weightUnit,
                createdDate: new Date()
            }

            await addDoc(weightEntriesRef, {
                ...newWeightEntry,
                createdDate: serverTimestamp()
            })

            closeDialog()
            
            // Reload the page after successful weight addition
            window.location.reload()
        }
        catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const toggleUnit = async () => {
        state.weightUnit = state.weightUnit === 'lb' ? 'kg' : 'lb';
    }
</script>

<template>
    <div v-show="isOpen" id='dialog-container' class="fixed inset-0 bg-black/50 flex justify-center items-center min-w-[300px] z-50">
        <div data-testid='dialog-content' class="relative flex flex-col justify-center items-center h-64 w-72 dark:bg-gray-800 bg-white/90 backdrop-blur-sm px-4 rounded-xl">
            <p data-testid='close-dialog' @click="closeDialog" class="inline-flex absolute top-3 right-3 text-2xl cursor-pointer dark:text-white">✕</p>
            <form @submit.prevent="handleSubmit" class="flex flex-col justify-center items-start dark:text-gray-200 text-[#4B4B4B] text-lg w-full tracking-wide">
                <div id="current-weight-group" class="flex flex-col w-full">
                    <label class="mb-3 mt-3 text-xl font-normal" for="current-weight">Add your current weight</label>
                    <div class="flex w-full items-start h-10">
                        <NumberInput
                            v-model="currentWeight"
                            id="current-weight"
                            name="current-weight"
                            :placeholder="`enter weight (${state.weightUnit})`"
                            :min="0.1"
                            :max="1000"
                            class="w-[75%] h-full"
                        />
                        <div class="flex w-[25%] h-full">
                            <button
                                type="button"
                                @click="toggleUnit"
                                :class="{
                                    'bg-blue-600 text-white': state.weightUnit === 'lb',
                                    'dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-700': state.weightUnit !== 'lb',
                                }"
                                class="flex-1 rounded-l transition-opacity duration-200"
                            >
                                lb
                            </button>
                            <button
                                type="button"
                                @click="toggleUnit"
                                :class="{
                                    'bg-blue-600 text-white': state.weightUnit === 'kg',
                                    'dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-700': state.weightUnit !== 'kg',
                                }"
                                class="flex-1 rounded-r transition-opacity duration-200"
                            >
                                kg
                            </button>
                        </div>
                    </div>
                </div>
                <input
                    type="submit"
                    value="Submit"
                    class="mt-4 mb-3 bg-blue-600 hover:bg-blue-700 h-10 w-full rounded-lg text-white font-semibold cursor-pointer transition-colors duration-200"
                />
            </form>
        </div>
    </div>
    <div class="flex justify-center items-center p-2 bg-[#6D1D7C] hover:bg-[#5a1766] rounded-full cursor-pointer transition-colors duration-200">
        <div @click="handleDialog" data-testid="add-weight-btn" class="bg-[url('/assets/plus.png')] bg-no-repeat bg-contain h-8 w-8"></div>
    </div>
</template>
