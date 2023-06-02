import {
  MsgCreateGroupSDKTypeEIP712,
  MsgCreateGroupTypeUrl,
} from '@/messages/greenfield/storage/MsgCreateGroup';
import {
  MsgDeleteGroupSDKTypeEIP712,
  MsgDeleteGroupTypeUrl,
} from '@/messages/greenfield/storage/MsgDeleteGroup';
import {
  MsgLeaveGroupSDKTypeEIP712,
  MsgLeaveGroupTypeUrl,
} from '@/messages/greenfield/storage/MsgLeaveGroup';
import {
  MsgUpdateGroupMemberSDKTypeEIP712,
  MsgUpdateGroupMemberTypeUrl,
} from '@/messages/greenfield/storage/MsgUpdateGroupMember';
import {
  QueryHeadGroupMemberResponse,
  QueryHeadGroupResponse,
  QueryPolicyForGroupRequest,
  QueryPolicyForGroupResponse,
} from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/query';
import {
  MsgCreateGroup,
  MsgDeleteGroup,
  MsgLeaveGroup,
  MsgPutPolicy,
  MsgUpdateGroupMember,
} from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/tx';
import { container, delay, inject, singleton } from 'tsyringe';
import { TxResponse } from '..';
import { Basic } from './basic';
import { RpcQueryClient } from './queryclient';
import { newBucketGRN, GRNToString, newObjectGRN, newGroupGRN } from '@/utils/grn';
import { Storage } from './storage';

export interface IGroup {
  /**
   * create a new group on greenfield chain the group members can be initialized  or not
   */
  createGroup(msg: MsgCreateGroup): Promise<TxResponse>;

  /**
   * send DeleteGroup txn to greenfield chain and return txn hash
   */
  deleteGroup(msg: MsgDeleteGroup): Promise<TxResponse>;

  /**
   * support adding or removing members from the group and return the txn hash
   */
  updateGroupMember(msg: MsgUpdateGroupMember): Promise<TxResponse>;

  /**
   * make the member leave the specific group
   */
  leaveGroup(address: string, msg: MsgLeaveGroup): Promise<TxResponse>;

  /**
   * query the groupInfo on chain, return the group info if exists
   */
  headGroup(groupName: string, groupOwner: string): Promise<QueryHeadGroupResponse>;

  /**
   * query the group member info on chain, return true if the member exists in group
   */
  headGroupMember(
    groupName: string,
    groupOwner: string,
    member: string,
  ): Promise<QueryHeadGroupMemberResponse>;

  /**
   * get the bucket policy info of the group specified by group id
   * it queries a bucket policy that grants permission to a group
   */
  getPolicyOfGroup(request: QueryPolicyForGroupRequest): Promise<QueryPolicyForGroupResponse>;

  // TODO: putGroupPolicy compire with bucket.putBucketPolicy

  getBucketPolicyOfGroup(bucketName: string, groupId: number): Promise<QueryPolicyForGroupResponse>;

  getObjectPolicyOfGroup(
    bucketName: string,
    objectName: string,
    groupId: number,
  ): Promise<QueryPolicyForGroupResponse>;
}

@singleton()
export class Group implements IGroup {
  constructor(
    @inject(delay(() => Basic)) private basic: Basic,
    @inject(delay(() => Storage)) private storage: Storage,
  ) {}

  private queryClient: RpcQueryClient = container.resolve(RpcQueryClient);

  public async createGroup(msg: MsgCreateGroup) {
    return await this.basic.tx(
      MsgCreateGroupTypeUrl,
      msg.creator,
      MsgCreateGroupSDKTypeEIP712,
      MsgCreateGroup.toSDK(msg),
      MsgCreateGroup.encode(msg).finish(),
    );
  }

  public async deleteGroup(msg: MsgDeleteGroup) {
    return await this.basic.tx(
      MsgDeleteGroupTypeUrl,
      msg.operator,
      MsgDeleteGroupSDKTypeEIP712,
      MsgDeleteGroup.toSDK(msg),
      MsgDeleteGroup.encode(msg).finish(),
    );
  }

  public async updateGroupMember(msg: MsgUpdateGroupMember) {
    if (msg.groupName === '') {
      throw new Error('group name is empty');
    }

    if (msg.membersToAdd.length === 0 && msg.membersToDelete.length === 0) {
      throw new Error('no update member');
    }

    return await this.basic.tx(
      MsgUpdateGroupMemberTypeUrl,
      msg.operator,
      MsgUpdateGroupMemberSDKTypeEIP712,
      MsgUpdateGroupMember.toSDK(msg),
      MsgUpdateGroupMember.encode(msg).finish(),
    );
  }

  public async leaveGroup(address: string, msg: MsgLeaveGroup) {
    return await this.basic.tx(
      MsgLeaveGroupTypeUrl,
      address,
      MsgLeaveGroupSDKTypeEIP712,
      MsgLeaveGroup.toSDK(msg),
      MsgLeaveGroup.encode(msg).finish(),
    );
  }

  public async headGroup(groupName: string, groupOwner: string) {
    const rpc = await this.queryClient.getStorageQueryClient();
    return await rpc.HeadGroup({
      groupName,
      groupOwner,
    });
  }

  public async headGroupMember(groupName: string, groupOwner: string, member: string) {
    const rpc = await this.queryClient.getStorageQueryClient();
    return await rpc.HeadGroupMember({
      groupName,
      groupOwner,
      member,
    });
  }

  public async getPolicyOfGroup(request: QueryPolicyForGroupRequest) {
    return await this.storage.getPolicyForGroup(request);
  }

  public async getBucketPolicyOfGroup(bucketName: string, groupId: number) {
    const resource = GRNToString(newBucketGRN(bucketName));
    return await this.storage.getPolicyForGroup({
      resource,
      principalGroupId: groupId.toString(),
    });
  }

  public async getObjectPolicyOfGroup(bucketName: string, objectName: string, groupId: number) {
    const resource = GRNToString(newObjectGRN(bucketName, objectName));

    return await this.storage.getPolicyForGroup({
      resource,
      principalGroupId: groupId.toString(),
    });
  }

  public async putGroupPolicy(
    owner: string,
    groupName: string,
    srcMsg: Omit<MsgPutPolicy, 'resource'>,
  ) {
    const resource = GRNToString(newGroupGRN(owner, groupName));
    const msg: MsgPutPolicy = {
      ...srcMsg,
      resource,
    };
    return this.storage.putPolicy(msg);
  }
}
