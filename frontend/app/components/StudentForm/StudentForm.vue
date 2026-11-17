<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { Student, StudentFormData } from '~/types/student';
import { buildStudentData, getStudentChanges } from '~/validation/studentForm';
import ErrorMessage from '~/components/ErrorMessage/ErrorMessage.vue';

const { createStudent, editStudent } = useStudentApi();

const props = defineProps<{
    student?: Student;
}>();

const isEditing = computed(() => props.student !== undefined);
const form = reactive<StudentFormData>({
    surname: props.student?.surname ?? '',
    name: props.student?.name ?? '',
    patronymic: props.student?.patronymic ?? '',
    group: props.student?.group ?? '',
    isuId: props.student?.isuId ?? '',
    dormitoryNumber: props.student?.dormitoryNumber ?? '',
    room: props.student?.room ?? '',
    moveInDate: props.student?.moveInDate ?? '',
    foreigner: props.student?.foreigner ?? false,
    notes: props.student?.notes ?? '',
});

const now = new Date();
const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
].join('-');

const errorMessage = ref('');
const isSubmitting = ref(false);

async function submitForm(): Promise<void> {
    if (isSubmitting.value) return;
    errorMessage.value = '';
    isSubmitting.value = true;

    try {
        const data = buildStudentData(form);

        if (props.student) {
            const changes = getStudentChanges(data, props.student);
            if (Object.keys(changes).length > 0) {
                await editStudent(props.student.id, changes);
            }

            await navigateTo(`/students/${props.student.id}`, {
                replace: true,
            });
        } else {
            const student = await createStudent(data);
            await navigateTo(`/students/${student.id}`, {
                replace: true,
            });
        }
    } catch (error: unknown) {
        errorMessage.value =
            error instanceof Error ? error.message : 'Не удалось сохранить студента';
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <section>
        <h1>
            {{ isEditing ? 'Редактирование студента' : 'Добавление студента' }}
        </h1>

        <ErrorMessage :error-message="errorMessage" />

        <form id="student-form" class="student-card" @submit.prevent="submitForm">
            <div class="form-row">
                <label for="surname">Фамилия <span class="required">*</span></label>
                <input
                    type="text"
                    id="surname"
                    name="surname"
                    v-model.trim="form.surname"
                    minlength="2"
                    maxlength="50"
                    placeholder="Иванов"
                    :disabled="isSubmitting"
                    required
                />
            </div>
            <div class="form-row">
                <label for="name">Имя <span class="required">*</span></label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    v-model.trim="form.name"
                    minlength="2"
                    maxlength="50"
                    placeholder="Иван"
                    :disabled="isSubmitting"
                    required
                />
            </div>
            <div class="form-row">
                <label for="patronymic">Отчество</label>
                <input
                    type="text"
                    id="patronymic"
                    name="patronymic"
                    v-model.trim="form.patronymic"
                    minlength="2"
                    maxlength="50"
                    placeholder="Иванович"
                    :disabled="isSubmitting"
                />
            </div>
            <div class="form-row">
                <label for="group">Группа <span class="required">*</span></label>
                <input
                    type="text"
                    id="group"
                    name="group"
                    v-model.trim="form.group"
                    pattern="[A-Z][0-9]{4}"
                    placeholder="W1234"
                    :disabled="isSubmitting"
                    required
                />
            </div>
            <div class="form-row">
                <label for="isuId">ИСУ id <span class="required">*</span></label>
                <input
                    type="text"
                    id="isuId"
                    name="isuId"
                    v-model.trim="form.isuId"
                    pattern="[1-9][0-9]{5}"
                    placeholder="123456"
                    oninvalid="this.setCustomValidity('ИСУ id должен содержать 6 цифр')"
                    oninput="this.setCustomValidity('')"
                    :disabled="isSubmitting"
                    required
                />
            </div>
            <div class="form-row">
                <label for="dormitoryNumber">Номер общежития</label>
                <input
                    type="number"
                    id="dormitoryNumber"
                    name="dormitoryNumber"
                    v-model.number="form.dormitoryNumber"
                    min="1"
                    max="100"
                    step="1"
                    :disabled="isSubmitting"
                />
            </div>
            <div class="form-row">
                <label for="room">Комната</label>
                <input
                    type="number"
                    id="room"
                    name="room"
                    v-model.number="form.room"
                    min="1"
                    max="1000"
                    step="1"
                    :disabled="isSubmitting"
                />
            </div>
            <div class="form-row">
                <label for="moveInDate">Дата заселения</label>
                <input
                    type="date"
                    id="moveInDate"
                    name="moveInDate"
                    v-model="form.moveInDate"
                    min="2000-01-01"
                    :max="today"
                    :disabled="isSubmitting"
                />
            </div>
            <div class="form-row">
                <label for="foreigner">Иностранец</label>
                <input
                    type="checkbox"
                    id="foreigner"
                    name="foreigner"
                    v-model="form.foreigner"
                    :disabled="isSubmitting"
                />
            </div>
            <div class="form-row">
                <label for="notes">Заметки</label>
                <textarea
                    id="notes"
                    name="notes"
                    v-model="form.notes"
                    :disabled="isSubmitting"
                ></textarea>
            </div>
            <div class="buttons-container">
                <button type="submit" class="buttons accept-button" :disabled="isSubmitting">
                    {{ isEditing ? 'Применить изменения' : 'Добавить студента' }}
                </button>

                <NuxtLink to="/students" class="buttons delete-button">
                    Отменить изменения
                </NuxtLink>
            </div>
        </form>
    </section>
</template>
