import { Provider } from "@nestjs/common";
import { DataSource, DataSourceOptions } from "typeorm";

export const DataSourceProvider: Provider = {
    provide: "DataSourceProvider",
    useFactory: async () => {
        const dataSource = new DataSource({
            type: "mariadb",
            host: "127.0.0.1",
            port: 3006,
            username: "test",
            password: "test",
            database: "test",
            entities: [__dirname + "/../**/*.entity{.ts,.js}"],
            // synchronize: configService.get<string>("ENV") == EnvType.DEV,
        } as DataSourceOptions);
        return dataSource.initialize();
    }
};