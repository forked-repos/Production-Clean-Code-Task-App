export default interface UserResponseDTO {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        biography: string;
        email: string;
        password: string;
    }
}