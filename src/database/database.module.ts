import { Module } from "@nestjs/common";
import { DataSourceProvider } from "./datasource.provider";

@Module({
    providers: [DataSourceProvider],
    exports: [DataSourceProvider],
})
export class DatabaseModule {}
