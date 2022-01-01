import {Injectable} from '@nestjs/common';
import {User} from "./users.model";

@Injectable()
export class UsersService {

    private readonly users: Array<User> = [
        {
            id: 1,
            name: 'magali',
            phonenumber: '+1601919780290',
        },
        {
            id: 2,
            name: 'arlette',
            phonenumber: '+4565480402801',
        },
        {
            id: 3,
            name: 'anouk',
            phonenumber: '+2570264151271',
        },
        {
            id: 4,
            name: 'omar',
            phonenumber: '+34600886756',
        }
    ];

    async findByPhoneNumber(phonenumber: string): Promise<User | undefined> {
        return this.users.find(user => user.phonenumber === phonenumber);
    }

    async findAll(): Promise<Array<User>> {
        return this.users;
    }
}
