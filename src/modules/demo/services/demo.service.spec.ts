import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/mysql';
import { Demo } from '@/modules/demo/entities/demo.entity';
import { NotFoundException } from '@nestjs/common';
import { DemoService } from '@/modules/demo/services/demo.service';

describe('DemoService', () => {
    let service: DemoService;
    let em: EntityManager;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DemoService,
                {
                    provide: EntityManager,
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findOneOrFail: jest.fn(),
                        findAndCount: jest.fn(),
                        persistAndFlush: jest.fn(),
                        removeAndFlush: jest.fn(),
                        create: jest.fn(),
                        assign: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<DemoService>(DemoService);
        em = module.get<EntityManager>(EntityManager);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('list', () => {
        it('should return an array of demos', async () => {
            const demos: Demo[] = [
                { id: 1, name: 'Demo 1', description: 'Test 1' } as Demo,
                { id: 2, name: 'Demo 2', description: 'Test 2' } as Demo,
            ];
            jest.spyOn(em, 'find').mockResolvedValue(demos);

            expect(await service.list()).toEqual(demos);
        });

        it('should handle empty result', async () => {
            jest.spyOn(em, 'find').mockResolvedValue([]);

            expect(await service.list()).toEqual([]);
        });
    });

    describe('paginate', () => {
        it('should return paginated demos', async () => {
            const demos: Demo[] = [
                { id: 1, name: 'Demo 1', description: 'Test 1' } as Demo,
                { id: 2, name: 'Demo 2', description: 'Test 2' } as Demo,
            ];
            const result = {
                items: demos,
                meta: {
                    itemCount: 2,
                    totalItems: 2,
                    perPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
            };
            jest.spyOn(em, 'findAndCount').mockResolvedValue([demos, 2]);

            expect(await service.paginate({ page: 1, limit: 10 })).toEqual(result);
        });

        it('should handle empty result', async () => {
            const result = {
                items: [] as Demo[],
                meta: {
                    itemCount: 0,
                    totalItems: 0,
                    perPage: 10,
                    totalPages: 0,
                    currentPage: 1,
                },
            };
            jest.spyOn(em, 'findAndCount').mockResolvedValue([[], 0]);

            expect(await service.paginate({ page: 1, limit: 10 })).toEqual(result);
        });
    });

    describe('detail', () => {
        it('should return a demo by id', async () => {
            const demo = { id: 1, name: 'Demo 1', description: 'Test 1' };
            jest.spyOn(em, 'findOneOrFail').mockResolvedValue(demo);

            expect(await service.detail(1)).toBe(demo);
        });

        it('should throw NotFoundException when demo not found', async () => {
            jest.spyOn(em, 'findOneOrFail').mockRejectedValue(
                new NotFoundException('Demo not found'),
            );

            await expect(service.detail(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create a new demo', async () => {
            const createDto = { name: 'New Demo', description: 'Test Description' };
            const demo = { id: 1, ...createDto };

            jest.spyOn(em, 'create').mockReturnValue(demo);
            jest.spyOn(em, 'persistAndFlush').mockResolvedValue(undefined);

            expect(await service.create(createDto)).toBe(demo);
            expect(em.persistAndFlush).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update an existing demo', async () => {
            const updateDto = { name: 'Updated Demo' };
            const existingDemo = { id: 1, name: 'Demo 1', description: 'Test 1' };
            const updatedDemo = { ...existingDemo, ...updateDto };

            jest.spyOn(em, 'findOneOrFail').mockResolvedValue(existingDemo);
            jest.spyOn(em, 'assign').mockReturnValue(updatedDemo);
            jest.spyOn(em, 'persistAndFlush').mockResolvedValue(undefined);

            const result = await service.update(1, updateDto);
            expect(result).toEqual(updatedDemo);
            expect(em.persistAndFlush).toHaveBeenCalled();
        });

        it('should throw NotFoundException when updating non-existing demo', async () => {
            jest.spyOn(em, 'findOneOrFail').mockRejectedValue(
                new NotFoundException('Demo not found'),
            );

            await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an existing demo', async () => {
            const demo = { id: 1, name: 'Demo 1', description: 'Test 1' };

            jest.spyOn(em, 'findOneOrFail').mockResolvedValue(demo);
            jest.spyOn(em, 'removeAndFlush').mockResolvedValue(undefined);

            await service.remove(1);
            expect(em.removeAndFlush).toHaveBeenCalledWith(demo);
        });

        it('should throw NotFoundException when removing non-existing demo', async () => {
            jest.spyOn(em, 'findOneOrFail').mockRejectedValue(
                new NotFoundException('Demo not found'),
            );

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
