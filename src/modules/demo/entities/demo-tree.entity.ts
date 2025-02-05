import { Entity, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { BaseTreeEntity } from '@/modules/database/base/base-tree.entity';
import { ApiHideProperty } from '@nestjs/swagger';

/**
 * DemoTree 实体类
 * @description 用于演示树形结构的数据实体
 */
@Entity()
export class DemoTree extends BaseTreeEntity<DemoTree> {
    @ApiHideProperty()
    @ManyToOne(() => DemoTree, { nullable: true, fieldName: 'parent_id' })
    declare parent?: DemoTree;

    @ApiHideProperty()
    @OneToMany(() => DemoTree, (node) => node.parent)
    declare children: Collection<DemoTree>;
}
