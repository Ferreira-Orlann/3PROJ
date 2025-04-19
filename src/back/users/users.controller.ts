import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./users.dto";
import { UUID } from "crypto";
import { HttpAuthGuard, IAuthRequest } from "../authentication/http.authentication.guard";
import { ConfigService } from "@nestjs/config";
import { ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { User, BasicUser } from "./users.entity";

@Controller("users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService
    ) {}

    @Get()
    @ApiResponse({
        type: BasicUser
    })
    @ApiQuery({
        name: "page",
        required: false,
        type: Number
    })
    @ApiQuery({
        name: "pageSize",
        required: false,
        type: Number
    })
    @ApiQuery({
        name: "basic",
        required: false,
        type: Boolean
    })
    async getBasic(
        @Request() req: IAuthRequest, 
        @Query("page") page: number = 1, 
        @Query("pageSize") pageSize: number = 10,
        @Query("basic") basic: boolean = true,
        
    ): Promise<User[]> {
        // const en = await this.authzService.enforce(
        //     req.user?.uuid,
        //     "test",
        //     "message",
        //     "CREATE",
        // );
        // console.log("Bool:", en);
        // console.log(await this.authzService.getAllSubjects());
        // console.log(await this.authzService.getAllRoles());
        // console.log(await this.authzService.getAllObjects());
        // console.log(await this.authzService.getAllActions());
        // console.log(await this.authzService.getUsersForRole("admin", "test"));
        if (basic) {
            pageSize = Math.min(pageSize, this.configService.get<number>("API_PAGE_SIZE_LIMIT"))
            const pageData = await this.usersService.findPaging(page, pageSize)
            pageData.map((user) => {
                Object.setPrototypeOf(user, BasicUser)
            })
        }
        // pageData.map((user) => {
        //     Object.setPrototypeOf(user, User)
        // })
        else {
            pageSize = Math.min(pageSize, this.configService.get<number>("API_PAGE_SIZE_LIMIT"))
            const pageData = await this.usersService.findPaging(page, pageSize)
            return pageData
        }
    }

    @Get(":mail")
    findAll() {
        return this.usersService.findAll();
    }


    @Get(":id")
    getById(@Param("id") id: UUID) {
        return this.usersService.findOneByUuid(id);
    }

    @Post()
    async create(@Body() dto: CreateUserDto) {
        return await this.usersService.add(dto);
    }

    @Put(":uuid")
    async update(@Param("uuid") uuid: UUID, @Body() dto: CreateUserDto) {
        return await this.usersService.update(uuid, dto);
    }
}
