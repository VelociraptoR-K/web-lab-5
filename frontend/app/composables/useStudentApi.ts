import type { StudentsQuery } from '~/types/filterParams';
import type {
    Student,
    StudentResponse,
    StudentsPage,
    CreateStudentRequest,
    UpdateStudentRequest,
} from '~/types/student';
import { notifyStudentsChanged } from '~/streams/studentChanges';

export function useStudentApi() {
    const nuxtApp = useNuxtApp();
    const { $api } = nuxtApp;

    function clearStudentCache(): void {
        for (const key of Object.keys(nuxtApp.payload.data)) {
            if (key.startsWith('students-list:')) {
                delete nuxtApp.payload.data[key];
            }
        }
    }

    function getStudents(query: StudentsQuery): Promise<StudentsPage> {
        const useQuery =
            (query.group?.length ?? 0) > 1 ||
            (query.dormitoryNumber?.length ?? 0) > 1 ||
            (query.room?.length ?? 0) > 1;

        if (useQuery) {
            return getAllStudentsQuery(query);
        }

        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined) continue;
            const parameter = Array.isArray(value) ? value[0] : value;

            if (parameter !== undefined) {
                params.set(key, String(parameter));
            }
        }

        return getAllStudentsFiltered(params);
    }

    function getAllStudentsFiltered(params: URLSearchParams): Promise<StudentsPage> {
        return $api<StudentsPage>(`/students?${params.toString()}`, {
            method: 'GET',
        });
    }

    function getAllStudentsQuery(params: StudentsQuery): Promise<StudentsPage> {
        return $api<StudentsPage>('/students', {
            method: 'QUERY',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
    }

    async function getStudentById(id: number): Promise<Student> {
        const data = await $api<StudentResponse>(`/students/${id}`, {
            method: 'GET',
        });

        return data.student;
    }

    async function createStudent(student: CreateStudentRequest): Promise<Student> {
        const data = await $api<StudentResponse>('/students', {
            method: 'POST',
            body: student,
        });

        clearStudentCache();
        if (import.meta.client) {
            notifyStudentsChanged();
        }

        return data.student;
    }

    async function editStudent(id: number, changedFields: UpdateStudentRequest): Promise<Student> {
        const data = await $api<StudentResponse>(`/students/${id}`, {
            method: 'PATCH',
            body: changedFields,
        });

        clearStudentCache();
        if (import.meta.client) {
            notifyStudentsChanged();
        }

        return data.student;
    }

    async function deleteStudent(id: number): Promise<void> {
        await $api<void>(`/students/${id}`, {
            method: 'DELETE',
        });

        clearStudentCache();
        if (import.meta.client) {
            notifyStudentsChanged();
        }
    }

    return {
        clearStudentCache,
        getStudents,
        getAllStudentsFiltered,
        getStudentById,
        getAllStudentsQuery,
        createStudent,
        editStudent,
        deleteStudent,
    };
}
