package com.tcc.splith.repository;

import com.tcc.splith.entity.GroupMember;
import com.tcc.splith.entity.GroupMemberId;
import com.tcc.splith.entity.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    List<GroupMember> findByGroupId(Long groupId);
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
    long countByGroupIdAndRole(Long groupId, GroupRole role);
}
