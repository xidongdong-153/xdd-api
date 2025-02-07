import { Test, TestingModule } from '@nestjs/testing';

import { PaginateReturn } from '@/modules/database/types';
import { DemoController } from '@/modules/demo/controllers/demo.controller';
import { CreateDemoDto } from '@/modules/demo/dtos/create-demo.dto';
import { UpdateDemoDto } from '@/modules/demo/dtos/update-demo.dto';
import { Demo } from '@/modules/demo/entities/demo.entity';
import { DemoService } from '@/modules/demo/services/demo.service';

describe('DemoController', () => {
    let controller: DemoController;
    let service: DemoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DemoController],
            providers: [
                {
                    provide: DemoService,
                    useValue: {
                        list: jest.fn(),
                        paginate: jest.fn(),
                        detail: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<DemoController>(DemoController);
        service = module.get<DemoService>(DemoService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('list', () => {
        it('should return an array of demos', async () => {
            const demos: Demo[] = [
                { id: 1, name: 'Demo 1', description: 'Test 1' } as Demo,
                { id: 2, name: 'Demo 2', description: 'Test 2' } as Demo,
            ];
            jest.spyOn(service, 'list').mockResolvedValue(demos);

            expect(await controller.list()).toBe(demos);
        });
    });

    describe('paginate', () => {
        it('should return paginated demos', async () => {
            const demos: Demo[] = [
                { id: 1, name: 'Demo 1', description: 'Test 1' } as Demo,
                { id: 2, name: 'Demo 2', description: 'Test 2' } as Demo,
            ];
            const result: PaginateReturn<Demo> = {
                items: demos,
                meta: {
                    itemCount: 2,
                    totalItems: 2,
                    perPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
            };
            jest.spyOn(service, 'paginate').mockResolvedValue(result);

            const pageDemoDto = { page: 1, limit: 10 };
            expect(await controller.paginate(pageDemoDto)).toBe(result);
        });
    });

    describe('findOne', () => {
        it('should return a demo by id', async () => {
            const demo = { id: 1, name: 'Demo 1', description: 'Test 1' } as Demo;
            jest.spyOn(service, 'detail').mockResolvedValue(demo);

            expect(await controller.findOne('1')).toBe(demo);
        });
    });

    describe('create', () => {
        it('should create a new demo', async () => {
            const createDto: CreateDemoDto = {
                name: 'New Demo',
                description: 'Test Description',
            };
            const demo = { id: 1, ...createDto } as Demo;
            jest.spyOn(service, 'create').mockResolvedValue(demo);

            expect(await controller.create(createDto)).toBe(demo);
        });
    });

    describe('update', () => {
        it('should update a demo', async () => {
            const updateDto: UpdateDemoDto = {
                name: 'Updated Demo',
                description: 'Updated Description',
            };
            const demo = { id: 1, ...updateDto } as Demo;
            jest.spyOn(service, 'update').mockResolvedValue(demo);

            expect(await controller.update('1', updateDto)).toBe(demo);
        });
    });

    describe('remove', () => {
        it('should remove a demo', async () => {
            jest.spyOn(service, 'remove').mockResolvedValue(undefined);

            await controller.remove('1');
            expect(service.remove).toHaveBeenCalledWith(1);
        });
    });
});
